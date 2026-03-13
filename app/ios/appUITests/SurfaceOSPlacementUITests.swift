import XCTest

final class SurfaceOSPlacementUITests: XCTestCase {
  private var app: XCUIApplication!
  private var springboard: XCUIApplication!
  private var interruptionToken: NSObjectProtocol?

  override func setUpWithError() throws {
    continueAfterFailure = false
    app = XCUIApplication()
    springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
    interruptionToken = InterruptionHandling.installSystemAlertMonitor(on: self)
  }

  override func tearDownWithError() throws {
    app = nil
    springboard = nil
    interruptionToken = nil
  }

  private func launch(_ args: [String]) {
    app.terminate()
    app.launchArguments = args
    app.launch()
    app.tap()
  }

  private func capture(_ name: String) {
    let shot = XCUIScreen.main.screenshot()
    let attachment = XCTAttachment(screenshot: shot)
    attachment.name = name
    attachment.lifetime = .keepAlways
    add(attachment)
  }

  private func captureSurfaceSnapshot(_ id: String, attachmentName: String) {
    launch([
      "-e2e_open_screen", "surface_snapshot",
      "-e2e_surface_snapshot", id
    ])
    assertExists("surface-snapshot-ready-\(id)", timeout: 10)
    assertExists("surface-snapshot-ready", timeout: 10)
    capture(attachmentName)
  }

  private func assertExists(_ testID: String, timeout: TimeInterval) {
    let exists = app.otherElements[testID].waitForExistence(timeout: timeout)
    XCTAssertTrue(exists, "Missing testID=\(testID)\n--- app.debugDescription ---\n\(app.debugDescription)")
  }

  private func assertAnyExists(_ testIDs: [String], timeout: TimeInterval) {
    let start = Date()
    while Date().timeIntervalSince(start) < timeout {
      if testIDs.contains(where: { app.otherElements[$0].exists }) {
        return
      }
      RunLoop.current.run(until: Date().addingTimeInterval(0.2))
    }
    XCTFail("Missing any testID in \(testIDs)\n--- app.debugDescription ---\n\(app.debugDescription)")
  }

  func testSurfaceOS01_WidgetNormalPlacementShot() throws {
    captureSurfaceSnapshot("SF-01", attachmentName: "surface-os_widget_normal")
    XCUIDevice.shared.press(.home)
    XCTAssertTrue(springboard.wait(for: .runningForeground, timeout: 5))
    capture("surface-os_home_after_widget_normal")
  }

  func testSurfaceOS02_WidgetRehabPlacementShot() throws {
    captureSurfaceSnapshot("SF-02", attachmentName: "surface-os_widget_rehab")
    XCUIDevice.shared.press(.home)
    XCTAssertTrue(springboard.wait(for: .runningForeground, timeout: 5))
    capture("surface-os_home_after_widget_rehab")
  }

  func testSurfaceOS03_IntentStartShot() throws {
    launch([
      "-e2e_state", "due_normal",
      "-e2e_session_seconds", "900",
      "-e2e_surface_source", "app_intent",
      "-e2e_surface_action", "start"
    ])
    assertAnyExists(["active-session-screen", "completion-screen"], timeout: 12)
    capture("surface-os_intent_start")
  }

  func testSurfaceOS04_IntentStart5mShot() throws {
    launch([
      "-e2e_state", "due_rehab3",
      "-e2e_session_seconds", "900",
      "-e2e_surface_source", "app_intent",
      "-e2e_surface_action", "start_5m"
    ])
    assertAnyExists(["active-session-screen", "completion-screen"], timeout: 12)
    capture("surface-os_intent_start_5m")
  }

  func testSurfaceOS05_IntentShowTodayBookShot() throws {
    launch([
      "-e2e_surface_source", "app_intent",
      "-e2e_surface_action", "show_today_book"
    ])
    assertExists("focus-core-screen", timeout: 12)
    capture("surface-os_intent_show_today_book")
  }
}
