import Foundation

typealias RCTPromiseResolveBlock = (Any?) -> Void
typealias RCTPromiseRejectBlock = (String?, String?, Error?) -> Void

@objc(PersistenceBridge)
final class PersistenceBridge: NSObject {
  private func readLaunchArgValue(_ key: String) -> String? {
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

  private func withStore(
    _ resolve: @escaping RCTPromiseResolveBlock,
    _ reject: @escaping RCTPromiseRejectBlock,
    run: @escaping @MainActor () throws -> Any?
  ) {
    guard #available(iOS 17.0, *) else {
      reject("E_UNSUPPORTED", "PersistenceBridge requires iOS 17+", nil)
      return
    }

    Task { @MainActor in
      do {
        let value = try run()
        resolve(value ?? NSNull())
      } catch {
        reject("E_PERSISTENCE", error.localizedDescription, error)
      }
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc(getLaunchArg:resolver:rejecter:)
  func getLaunchArg(
    _ key: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    _ = reject
    resolve(readLaunchArgValue(key))
  }

  @objc(getSettings:rejecter:)
  func getSettings(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    withStore(resolve, reject) {
      if let settings = try PersistenceStore.shared().getSettings() {
        return settings.toDTO()
      }
      return nil
    }
  }

  @objc(saveSettings:resolver:rejecter:)
  func saveSettings(
    _ params: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    withStore(resolve, reject) {
      let decoded = try SaveSettingsParams.decode(from: params)
      try PersistenceStore.shared().saveSettings(decoded)
      return nil
    }
  }

  @objc(getBooks:rejecter:)
  func getBooks(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    withStore(resolve, reject) {
      try PersistenceStore.shared().getBooks().map { $0.toDTO() }
    }
  }

  @objc(getBook:resolver:rejecter:)
  func getBook(_ bookId: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    withStore(resolve, reject) {
      try PersistenceStore.shared().getBook(bookId: bookId)?.toDTO()
    }
  }

  @objc(saveBook:resolver:rejecter:)
  func saveBook(
    _ params: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    withStore(resolve, reject) {
      let decoded = try SaveBookParams.decode(from: params)
      try PersistenceStore.shared().saveBook(decoded)
      return nil
    }
  }

  @objc(getPlanForDate:resolver:rejecter:)
  func getPlanForDate(
    _ planDateISO: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    withStore(resolve, reject) {
      try PersistenceStore.shared().getPlanForDate(planDateISO: planDateISO)?.toDTO()
    }
  }

  @objc(getPlansFromTo:toISO:resolver:rejecter:)
  func getPlansFromTo(
    _ fromISO: String,
    toISO: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    withStore(resolve, reject) {
      try PersistenceStore.shared().getPlansFromTo(fromISO: fromISO, toISO: toISO).map { $0.toDTO() }
    }
  }

  @objc(upsertPlan:resolver:rejecter:)
  func upsertPlan(
    _ params: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    withStore(resolve, reject) {
      let decoded = try UpsertPlanParams.decode(from: params)
      try PersistenceStore.shared().upsertPlan(decoded)
      return nil
    }
  }

  @objc(finalizePlanAsMissed:resolver:rejecter:)
  func finalizePlanAsMissed(
    _ planDateISO: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    withStore(resolve, reject) {
      try PersistenceStore.shared().finalizePlanAsMissed(planDateISO: planDateISO)
      return nil
    }
  }

  @objc(startSession:mode:entryPoint:resolver:rejecter:)
  func startSession(
    _ planId: String,
    mode: String,
    entryPoint: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    withStore(resolve, reject) {
      try PersistenceStore.shared().startSession(planId: planId, mode: mode, entryPoint: entryPoint)
    }
  }

  @objc(getActiveSession:rejecter:)
  func getActiveSession(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    withStore(resolve, reject) {
      try PersistenceStore.shared().getActiveSession()
    }
  }

  @objc(reconcilePlans:triggerSource:resolver:rejecter:)
  func reconcilePlans(
    _ referenceDateISO: String,
    triggerSource: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    withStore(resolve, reject) {
      let result = try PersistenceStore.shared().reconcilePlans(referenceDateISO: referenceDateISO, triggerSource: triggerSource)
      return result.toDictionary()
    }
  }
}
