import Foundation
import SwiftData

@available(iOS 17.0, *)
@Model
final class BookEntity {
  @Attribute(.unique) var id: String
  var title: String
  var author: String?
  var googleBooksId: String?
  var thumbnailUrl: String?
  var pageCount: Int?
  var format: String
  var status: String
  var estimatedPriceAmount: Double?
  var estimatedPriceCurrency: String?

  init(
    id: String,
    title: String,
    author: String? = nil,
    googleBooksId: String? = nil,
    thumbnailUrl: String? = nil,
    pageCount: Int? = nil,
    format: String = "paper",
    status: String = "active",
    estimatedPriceAmount: Double? = nil,
    estimatedPriceCurrency: String? = nil
  ) {
    self.id = id
    self.title = title
    self.author = author
    self.googleBooksId = googleBooksId
    self.thumbnailUrl = thumbnailUrl
    self.pageCount = pageCount
    self.format = format
    self.status = status
    self.estimatedPriceAmount = estimatedPriceAmount
    self.estimatedPriceCurrency = estimatedPriceCurrency
  }

  func toDTO() -> [String: Any] {
    var dto: [String: Any] = [
      "id": id,
      "title": title,
      "format": format,
      "status": status,
    ]
    dto["author"] = author
    dto["googleBooksId"] = googleBooksId
    dto["thumbnailUrl"] = thumbnailUrl
    dto["pageCount"] = pageCount
    dto["estimatedPriceAmount"] = estimatedPriceAmount
    dto["estimatedPriceCurrency"] = estimatedPriceCurrency
    return dto
  }
}

@available(iOS 17.0, *)
@Model
final class ExecutionPlanEntity {
  @Attribute(.unique) var planId: String
  var planDate: String
  var bookId: String
  var state: String
  var result: String
  var scheduledAt: String
  var retryCount: Int
  var snoozeCount: Int
  var consistencyCredit: Bool
  var continuousMissedDaysSnapshot: Int
  var startedAt: String?

  init(
    planId: String,
    planDate: String,
    bookId: String,
    state: String = "scheduled",
    result: String = "attempted",
    scheduledAt: String,
    retryCount: Int = 0,
    snoozeCount: Int = 0,
    consistencyCredit: Bool = false,
    continuousMissedDaysSnapshot: Int = 0,
    startedAt: String? = nil
  ) {
    self.planId = planId
    self.planDate = planDate
    self.bookId = bookId
    self.state = state
    self.result = result
    self.scheduledAt = scheduledAt
    self.retryCount = retryCount
    self.snoozeCount = snoozeCount
    self.consistencyCredit = consistencyCredit
    self.continuousMissedDaysSnapshot = continuousMissedDaysSnapshot
    self.startedAt = startedAt
  }

  func toDTO() -> [String: Any] {
    var dto: [String: Any] = [
      "planId": planId,
      "planDate": planDate,
      "bookId": bookId,
      "state": state,
      "result": result,
      "scheduledAt": scheduledAt,
      "retryCount": retryCount,
      "snoozeCount": snoozeCount,
      "consistencyCredit": consistencyCredit,
      "continuousMissedDaysSnapshot": continuousMissedDaysSnapshot,
    ]
    dto["startedAt"] = startedAt
    return dto
  }
}

@available(iOS 17.0, *)
@Model
final class SettingsEntity {
  // Single-row settings table. Fixed id keeps upsert simple.
  @Attribute(.unique) var id: String
  var dailyTargetTime: Int
  var defaultDuration: Int
  var retryLimit: Int
  var dayRolloverHour: Int
  var progressTrackingEnabled: Bool?
  var progressPromptShown: Bool?
  var notificationsEnabled: Bool?

  init(
    id: String = "default",
    dailyTargetTime: Int,
    defaultDuration: Int,
    retryLimit: Int,
    dayRolloverHour: Int,
    progressTrackingEnabled: Bool? = nil,
    progressPromptShown: Bool? = nil,
    notificationsEnabled: Bool? = nil
  ) {
    self.id = id
    self.dailyTargetTime = dailyTargetTime
    self.defaultDuration = defaultDuration
    self.retryLimit = retryLimit
    self.dayRolloverHour = dayRolloverHour
    self.progressTrackingEnabled = progressTrackingEnabled
    self.progressPromptShown = progressPromptShown
    self.notificationsEnabled = notificationsEnabled
  }

  func toDTO() -> [String: Any] {
    var dto: [String: Any] = [
      "dailyTargetTime": dailyTargetTime,
      "defaultDuration": defaultDuration,
      "retryLimit": retryLimit,
      "dayRolloverHour": dayRolloverHour,
    ]
    dto["progressTrackingEnabled"] = progressTrackingEnabled
    dto["progressPromptShown"] = progressPromptShown
    dto["notificationsEnabled"] = notificationsEnabled
    return dto
  }
}

@available(iOS 17.0, *)
@Model
final class SessionLogEntity {
  @Attribute(.unique) var sessionId: String
  var planId: String
  var mode: String
  var startedAt: String
  var endedAt: String?
  var outcome: String

  init(
    sessionId: String,
    planId: String,
    mode: String,
    startedAt: String,
    endedAt: String? = nil,
    outcome: String
  ) {
    self.sessionId = sessionId
    self.planId = planId
    self.mode = mode
    self.startedAt = startedAt
    self.endedAt = endedAt
    self.outcome = outcome
  }

  func toDTO() -> [String: Any] {
    var dto: [String: Any] = [
      "sessionId": sessionId,
      "planId": planId,
      "mode": mode,
      "startedAt": startedAt,
      "outcome": outcome,
    ]
    dto["endedAt"] = endedAt
    return dto
  }
}
