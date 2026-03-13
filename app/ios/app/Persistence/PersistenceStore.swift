import Foundation
import SwiftData

@available(iOS 17.0, *)
enum PersistenceError: LocalizedError {
  case decodeError(String)
  case notFound(String)
  case unsupported(String)

  var errorDescription: String? {
    switch self {
    case .decodeError(let message):
      return message
    case .notFound(let message):
      return message
    case .unsupported(let message):
      return message
    }
  }
}

@available(iOS 17.0, *)
struct ReconcileResultDTO {
  let finalizedMissedCount: Int
  let placeholderCreatedCount: Int
  let todayPlanCreated: Bool
  let continuousMissedDays: Int
  let todayPlan: ExecutionPlanEntity?

  func toDictionary() -> [String: Any] {
    var dto: [String: Any] = [
      "finalizedMissedCount": finalizedMissedCount,
      "placeholderCreatedCount": placeholderCreatedCount,
      "todayPlanCreated": todayPlanCreated,
      "continuousMissedDays": continuousMissedDays,
    ]
    dto["todayPlan"] = todayPlan?.toDTO()
    return dto
  }
}

@available(iOS 17.0, *)
private struct E2EInjectedPlanState {
  let missedDays: Int?
  let state: String?
  let retryCount: Int?
  let overrideBookId: String?
  let forceHeavyDay: Bool?
}

@available(iOS 17.0, *)
@MainActor
final class PersistenceStore {
  private static var cachedInstance: PersistenceStore?

  static func shared() throws -> PersistenceStore {
    if let instance = cachedInstance {
      return instance
    }
    let instance = try PersistenceStore()
    cachedInstance = instance
    return instance
  }

  private let container: ModelContainer
  private let context: ModelContext
  private let isoFormatter: ISO8601DateFormatter
  private var e2eStartFailureConsumed = false
  private var e2eSaveBookFailureConsumed = false

  private init() throws {
    let schema = Schema([
      BookEntity.self,
      ExecutionPlanEntity.self,
      SettingsEntity.self,
      SessionLogEntity.self,
    ])

    let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
    container = try ModelContainer(for: schema, configurations: [config])
    context = ModelContext(container)

    isoFormatter = ISO8601DateFormatter()
    isoFormatter.timeZone = TimeZone(secondsFromGMT: 0)
    isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

    try ensureSeededIfNeeded()
  }

  func getSettings() throws -> SettingsEntity? {
    let descriptor = FetchDescriptor<SettingsEntity>()
    return try context.fetch(descriptor).first
  }

  func saveSettings(_ params: SaveSettingsParams) throws {
    let descriptor = FetchDescriptor<SettingsEntity>()
    if let existing = try context.fetch(descriptor).first {
      existing.dailyTargetTime = params.dailyTargetTime
      existing.defaultDuration = params.defaultDuration
      existing.retryLimit = params.retryLimit
      existing.dayRolloverHour = params.dayRolloverHour
      if let progressTrackingEnabled = params.progressTrackingEnabled {
        existing.progressTrackingEnabled = progressTrackingEnabled
      }
      if let progressPromptShown = params.progressPromptShown {
        existing.progressPromptShown = progressPromptShown
      }
      if let notificationsEnabled = params.notificationsEnabled {
        existing.notificationsEnabled = notificationsEnabled
      }
    } else {
      context.insert(
        SettingsEntity(
          dailyTargetTime: params.dailyTargetTime,
          defaultDuration: params.defaultDuration,
          retryLimit: params.retryLimit,
          dayRolloverHour: params.dayRolloverHour,
          progressTrackingEnabled: params.progressTrackingEnabled,
          progressPromptShown: params.progressPromptShown,
          notificationsEnabled: params.notificationsEnabled
        )
      )
    }
    try context.save()
  }

  func getBooks() throws -> [BookEntity] {
    let descriptor = FetchDescriptor<BookEntity>(sortBy: [SortDescriptor(\BookEntity.title)])
    return try context.fetch(descriptor)
  }

  func getBook(bookId: String) throws -> BookEntity? {
    let descriptor = FetchDescriptor<BookEntity>(predicate: #Predicate { $0.id == bookId })
    return try context.fetch(descriptor).first
  }

  func saveBook(_ params: SaveBookParams) throws {
    if e2eFailSaveBookOnceFromLaunchArgs() {
      throw PersistenceError.unsupported("E2E injected saveBook failure")
    }

    let bookId = params.id
    let descriptor = FetchDescriptor<BookEntity>(predicate: #Predicate { $0.id == bookId })
    if let existing = try context.fetch(descriptor).first {
      existing.title = params.title
      existing.author = params.author
      existing.googleBooksId = params.googleBooksId
      existing.thumbnailUrl = params.thumbnailUrl
      existing.pageCount = params.pageCount
      existing.format = params.format ?? existing.format
      existing.status = params.status ?? existing.status
      existing.estimatedPriceAmount = params.estimatedPriceAmount
      existing.estimatedPriceCurrency = params.estimatedPriceCurrency
    } else {
      context.insert(
        BookEntity(
          id: params.id,
          title: params.title,
          author: params.author,
          googleBooksId: params.googleBooksId,
          thumbnailUrl: params.thumbnailUrl,
          pageCount: params.pageCount,
          format: params.format ?? "paper",
          status: params.status ?? "active",
          estimatedPriceAmount: params.estimatedPriceAmount,
          estimatedPriceCurrency: params.estimatedPriceCurrency
        )
      )
    }
    try context.save()
  }

  func getPlanForDate(planDateISO: String) throws -> ExecutionPlanEntity? {
    let descriptor = FetchDescriptor<ExecutionPlanEntity>(predicate: #Predicate { $0.planDate == planDateISO })
    return try context.fetch(descriptor).first
  }

  func getPlansFromTo(fromISO: String, toISO: String) throws -> [ExecutionPlanEntity] {
    let from = String(fromISO.prefix(10))
    let to = String(toISO.prefix(10))
    let descriptor = FetchDescriptor<ExecutionPlanEntity>(
      predicate: #Predicate { plan in
        plan.planDate >= from && plan.planDate <= to
      },
      sortBy: [SortDescriptor(\ExecutionPlanEntity.planDate)]
    )
    return try context.fetch(descriptor)
  }

  func upsertPlan(_ params: UpsertPlanParams) throws {
    let existing = try findPlan(planId: params.planId, planDate: params.planDate)
    if let existing {
      if let bookId = params.bookId { existing.bookId = bookId }
      if let state = params.state { existing.state = state }
      if let result = params.result { existing.result = result }
      if let scheduledAt = params.scheduledAt { existing.scheduledAt = scheduledAt }
      if let retryCount = params.retryCount { existing.retryCount = retryCount }
      if let snoozeCount = params.snoozeCount { existing.snoozeCount = snoozeCount }
      if let consistencyCredit = params.consistencyCredit { existing.consistencyCredit = consistencyCredit }
      if let snapshot = params.continuousMissedDaysSnapshot { existing.continuousMissedDaysSnapshot = snapshot }
      if let startedAt = params.startedAt { existing.startedAt = startedAt }
      if let planId = params.planId { existing.planId = planId }
    } else {
      guard let bookId = params.bookId else {
        throw PersistenceError.decodeError("bookId is required when creating a plan")
      }
      context.insert(
        ExecutionPlanEntity(
          planId: params.planId ?? "native_plan_\(params.planDate)",
          planDate: params.planDate,
          bookId: bookId,
          state: params.state ?? "scheduled",
          result: params.result ?? "attempted",
          scheduledAt: params.scheduledAt ?? startOfDayISO(params.planDate),
          retryCount: params.retryCount ?? 0,
          snoozeCount: params.snoozeCount ?? 0,
          consistencyCredit: params.consistencyCredit ?? false,
          continuousMissedDaysSnapshot: params.continuousMissedDaysSnapshot ?? 0,
          startedAt: params.startedAt
        )
      )
    }
    try context.save()
  }

  func finalizePlanAsMissed(planDateISO: String) throws {
    guard let plan = try getPlanForDate(planDateISO: planDateISO) else {
      return
    }
    plan.state = "finalized"
    plan.result = "missed"
    try context.save()
  }

  func startSession(planId: String, mode: String, entryPoint: String) throws -> [String: Any] {
    _ = entryPoint

    if e2eFailStartOnceFromLaunchArgs() {
      throw PersistenceError.unsupported("E2E injected start failure")
    }

    guard let plan = try findPlan(planId: planId, planDate: nil) else {
      throw PersistenceError.notFound("Plan not found: \(planId)")
    }

    let startedAt = nowISO8601()
    let sessionId = "native_session_\(Int(Date().timeIntervalSince1970 * 1000))"

    let session = SessionLogEntity(
      sessionId: sessionId,
      planId: plan.planId,
      mode: mode,
      startedAt: startedAt,
      endedAt: nil,
      outcome: "active"
    )
    context.insert(session)

    plan.state = "active"
    plan.result = "attempted"
    plan.startedAt = startedAt

    try context.save()

    let bookTitle = try getBook(bookId: plan.bookId)?.title ?? "Reading Session"
    var response: [String: Any] = [
      "sessionId": sessionId,
      "startedAt": startedAt,
      "bookTitle": bookTitle,
    ]
    if let seconds = e2eSessionSecondsFromLaunchArgs() {
      response["e2eSessionSeconds"] = seconds
    }
    return response
  }

  func getActiveSession() throws -> [String: Any]? {
    let descriptor = FetchDescriptor<SessionLogEntity>(
      predicate: #Predicate { $0.endedAt == nil },
      sortBy: [SortDescriptor(\SessionLogEntity.startedAt, order: .reverse)]
    )

    guard let session = try context.fetch(descriptor).first else {
      return nil
    }

    guard let plan = try findPlan(planId: session.planId, planDate: nil) else {
      return nil
    }

    return [
      "plan": plan.toDTO(),
      "session": session.toDTO(),
    ]
  }

  func reconcilePlans(referenceDateISO: String, triggerSource: String) throws -> ReconcileResultDTO {
    _ = triggerSource
    try ensureSeededIfNeeded()

    let refDate = String(referenceDateISO.prefix(10))
    let today = refDate.isEmpty ? currentPlanDate() : refDate

    let allDescriptor = FetchDescriptor<ExecutionPlanEntity>(sortBy: [SortDescriptor(\ExecutionPlanEntity.planDate)])
    let plans = try context.fetch(allDescriptor)

    var finalizedMissedCount = 0
    for plan in plans where plan.planDate < today && plan.state != "finalized" {
      plan.state = "finalized"
      plan.result = "missed"
      finalizedMissedCount += 1
    }

    var todayPlan = plans.first(where: { $0.planDate == today })
    var createdToday = false

    if todayPlan == nil {
      let bookId = try selectTodayBookId()
      let newPlan = ExecutionPlanEntity(
        planId: "native_plan_\(today)",
        planDate: today,
        bookId: bookId,
        state: "scheduled",
        result: "attempted",
        scheduledAt: startOfDayISO(today),
        retryCount: 0,
        snoozeCount: 0,
        consistencyCredit: false,
        continuousMissedDaysSnapshot: 0,
        startedAt: nil
      )
      context.insert(newPlan)
      todayPlan = newPlan
      createdToday = true
    }

    let computedMissedStreak = try calculateMissedStreak(untilDateExclusive: today)
    let injected = injectedPlanStateFromLaunchArgs()
    let missedStreak = injected?.missedDays ?? computedMissedStreak
    todayPlan?.continuousMissedDaysSnapshot = missedStreak
    if let state = injected?.state {
      todayPlan?.state = state
      if state == "due" || state == "deferred" {
        todayPlan?.result = "attempted"
        todayPlan?.startedAt = nil
      }
    }
    if injected?.forceHeavyDay == true {
      todayPlan?.state = "scheduled"
      todayPlan?.result = "attempted"
      todayPlan?.startedAt = nil
    }
    if let overrideBookId = injected?.overrideBookId {
      todayPlan?.bookId = overrideBookId
    }
    if let retryCount = injected?.retryCount {
      todayPlan?.retryCount = retryCount
    }

    if context.hasChanges {
      try context.save()
    }

    return ReconcileResultDTO(
      finalizedMissedCount: finalizedMissedCount,
      placeholderCreatedCount: createdToday ? 1 : 0,
      todayPlanCreated: createdToday,
      continuousMissedDays: missedStreak,
      todayPlan: todayPlan
    )
  }

  private func injectedPlanStateFromLaunchArgs() -> E2EInjectedPlanState? {
    guard let state = launchArgValue("e2e_state")?.lowercased() else {
      return nil
    }
    switch state {
    case "rehab3":
      return E2EInjectedPlanState(missedDays: 3, state: nil, retryCount: nil, overrideBookId: nil, forceHeavyDay: nil)
    case "rehab7":
      return E2EInjectedPlanState(missedDays: 7, state: nil, retryCount: nil, overrideBookId: nil, forceHeavyDay: nil)
    case "heavy_day":
      return E2EInjectedPlanState(missedDays: 0, state: "scheduled", retryCount: nil, overrideBookId: "__MISSING_BOOK__", forceHeavyDay: true)
    case "due_normal":
      return E2EInjectedPlanState(missedDays: 0, state: "due", retryCount: 0, overrideBookId: nil, forceHeavyDay: nil)
    case "due_rehab3":
      return E2EInjectedPlanState(missedDays: 3, state: "due", retryCount: 0, overrideBookId: nil, forceHeavyDay: nil)
    case "due_restart7":
      return E2EInjectedPlanState(missedDays: 7, state: "due", retryCount: 0, overrideBookId: nil, forceHeavyDay: nil)
    case "deferred_retry_pending":
      return E2EInjectedPlanState(missedDays: 0, state: "deferred", retryCount: 0, overrideBookId: nil, forceHeavyDay: nil)
    case "retry_fired_once":
      return E2EInjectedPlanState(missedDays: 0, state: "due", retryCount: 1, overrideBookId: nil, forceHeavyDay: nil)
    case "book_missing":
      return E2EInjectedPlanState(missedDays: 0, state: nil, retryCount: nil, overrideBookId: "__MISSING_BOOK__", forceHeavyDay: nil)
    default:
      return nil
    }
  }

  private func e2eFailStartOnceFromLaunchArgs() -> Bool {
    if e2eStartFailureConsumed {
      return false
    }
    guard let raw = launchArgValue("e2e_fail_start_once") else {
      return false
    }
    let enabled = raw == "1"
    if enabled {
      e2eStartFailureConsumed = true
    }
    return enabled
  }

  private func e2eSessionSecondsFromLaunchArgs() -> Int? {
    guard let raw = launchArgValue("e2e_session_seconds") else { return nil }
    return Int(raw)
  }

  private func e2eFailSaveBookOnceFromLaunchArgs() -> Bool {
    if e2eSaveBookFailureConsumed {
      return false
    }
    guard let raw = launchArgValue("e2e_fail_save_book_once") else {
      return false
    }
    let enabled = raw == "1"
    if enabled {
      e2eSaveBookFailureConsumed = true
    }
    return enabled
  }

  private func launchArgValue(_ key: String) -> String? {
    let args = ProcessInfo.processInfo.arguments
    let flag = "-\(key)"
    if let idx = args.firstIndex(of: flag), idx + 1 < args.count {
      return args[idx + 1]
    }
    if let value = UserDefaults.standard.string(forKey: key) {
      return value
    }
    if let value = UserDefaults.standard.object(forKey: key) as? NSNumber {
      return value.stringValue
    }
    return nil
  }

  private func ensureSeededIfNeeded() throws {
    let descriptor = FetchDescriptor<BookEntity>()
    let books = try context.fetch(descriptor)
    let hasPrimary = books.contains(where: { $0.id == NativeCopy.PersistenceSeed.primaryBookId })
    let hasSecondary = books.contains(where: { $0.id == NativeCopy.PersistenceSeed.secondaryBookId })

    if !hasPrimary {
      context.insert(
        BookEntity(
          id: NativeCopy.PersistenceSeed.primaryBookId,
          title: NativeCopy.PersistenceSeed.primaryBookTitle,
          author: NativeCopy.PersistenceSeed.primaryBookAuthor,
          pageCount: NativeCopy.PersistenceSeed.primaryBookPageCount,
          format: "paper",
          status: "active"
        )
      )
    }

    if !hasSecondary {
      context.insert(
        BookEntity(
          id: NativeCopy.PersistenceSeed.secondaryBookId,
          title: NativeCopy.PersistenceSeed.secondaryBookTitle,
          author: NativeCopy.PersistenceSeed.secondaryBookAuthor,
          pageCount: NativeCopy.PersistenceSeed.secondaryBookPageCount,
          format: "paper",
          status: "queued"
        )
      )
    }

    if launchArgValue("e2e_progress_tracking_enabled") == "1" {
      let settingsDescriptor = FetchDescriptor<SettingsEntity>()
      if let settings = try context.fetch(settingsDescriptor).first {
        settings.progressTrackingEnabled = true
        settings.progressPromptShown = true
      } else {
        context.insert(
          SettingsEntity(
            dailyTargetTime: 21 * 60,
            defaultDuration: 15,
            retryLimit: 1,
            dayRolloverHour: 4,
            progressTrackingEnabled: true,
            progressPromptShown: true,
            notificationsEnabled: true
          )
        )
      }
    }

    if context.hasChanges {
      try context.save()
    }
  }

  private func selectTodayBookId() throws -> String {
    let descriptor = FetchDescriptor<BookEntity>(sortBy: [SortDescriptor(\BookEntity.title)])
    guard let first = try context.fetch(descriptor).first else {
      throw PersistenceError.notFound("No books available")
    }
    return first.id
  }

  private func findPlan(planId: String?, planDate: String?) throws -> ExecutionPlanEntity? {
    if let planId {
      let byId = FetchDescriptor<ExecutionPlanEntity>(predicate: #Predicate { $0.planId == planId })
      if let plan = try context.fetch(byId).first {
        return plan
      }
    }

    if let planDate {
      let byDate = FetchDescriptor<ExecutionPlanEntity>(predicate: #Predicate { $0.planDate == planDate })
      if let plan = try context.fetch(byDate).first {
        return plan
      }
    }

    return nil
  }

  private func calculateMissedStreak(untilDateExclusive dateString: String) throws -> Int {
    var streak = 0
    var cursor = dateString

    while true {
      guard let previous = previousPlanDate(from: cursor) else {
        return streak
      }

      let descriptor = FetchDescriptor<ExecutionPlanEntity>(predicate: #Predicate { $0.planDate == previous })
      guard let plan = try context.fetch(descriptor).first else {
        return streak
      }

      if plan.result == "missed" {
        streak += 1
        cursor = previous
      } else {
        return streak
      }
    }
  }

  private func previousPlanDate(from dateString: String) -> String? {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = TimeZone.current
    formatter.dateFormat = "yyyy-MM-dd"

    guard let date = formatter.date(from: dateString) else {
      return nil
    }

    guard let prev = Calendar.current.date(byAdding: .day, value: -1, to: date) else {
      return nil
    }

    return formatter.string(from: prev)
  }

  private func currentPlanDate() -> String {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = TimeZone.current
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: Date())
  }

  private func startOfDayISO(_ planDate: String) -> String {
    return "\(planDate)T09:00:00.000Z"
  }

  private func nowISO8601() -> String {
    isoFormatter.string(from: Date())
  }
}
