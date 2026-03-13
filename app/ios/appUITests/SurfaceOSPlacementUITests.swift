import XCTest

final class SurfaceOSPlacementUITests: XCTestCase {
  private var app: XCUIApplication!
  private var springboard: XCUIApplication!

  override func setUpWithError() throws {
    continueAfterFailure = false
    app = XCUIApplication()
    springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
  }

  override func tearDownWithError() throws {
    app = nil
    springboard = nil
  }

  private func launch(_ args: [String]) {
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
    launch(["-e2e_surface_snapshot", id])
    XCTAssertTrue(app.otherElements["surface-snapshot-ready-\(id)"].waitForExistence(timeout: 10))
    capture(attachmentName)
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
      "-e2e_surface_source", "app_intent",
      "-e2e_surface_action", "start"
    ])
    XCTAssertTrue(app.otherElements["active-session-screen"].waitForExistence(timeout: 12))
    capture("surface-os_intent_start")
  }

  func testSurfaceOS04_IntentStart5mShot() throws {
    launch([
      "-e2e_state", "due_rehab3",
      "-e2e_surface_source", "app_intent",
      "-e2e_surface_action", "start_5m"
    ])
    XCTAssertTrue(app.otherElements["active-session-screen"].waitForExistence(timeout: 12))
    capture("surface-os_intent_start_5m")
  }

  func testSurfaceOS05_IntentShowTodayBookShot() throws {
    launch([
      "-e2e_surface_source", "app_intent",
      "-e2e_surface_action", "show_today_book"
    ])
    XCTAssertTrue(app.otherElements["focus-core-screen"].waitForExistence(timeout: 12))
    capture("surface-os_intent_show_today_book")
  }
}
