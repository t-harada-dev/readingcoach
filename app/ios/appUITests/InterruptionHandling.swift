import XCTest

enum InterruptionHandling {
  @discardableResult
  static func installSystemAlertMonitor() -> NSObjectProtocol {
    addUIInterruptionMonitor(withDescription: "System Alerts") { alert in
      let allow = alert.buttons["Allow"]
      if allow.exists {
        allow.tap()
        return true
      }

      let ok = alert.buttons["OK"]
      if ok.exists {
        ok.tap()
        return true
      }

      let dontAllow = alert.buttons["Don't Allow"]
      if dontAllow.exists {
        dontAllow.tap()
        return true
      }

      return false
    }
  }
}
