import XCTest

final class AcceptanceSmokeUITests: XCTestCase {
  private var app: XCUIApplication!
  private var interruptionToken: NSObjectProtocol?

  override func setUpWithError() throws {
    continueAfterFailure = false
    app = XCUIApplication()
    interruptionToken = InterruptionHandling.installSystemAlertMonitor(on: self)
  }

  override func tearDownWithError() throws {
    app = nil
    interruptionToken = nil
  }

  func testLaunchAndFocusCoreSmoke() throws {
    app.launch()

    // Required to trigger interruption monitor callbacks when alert is shown.
    app.tap()

    XCTAssertTrue(app.wait(for: .runningForeground, timeout: 10))
  }

  func testLaunchWithNativeAcceptanceArgsSmoke() throws {
    app.launchArguments = [
      "-e2e_state", "rehab3",
      "-e2e_session_seconds", "2"
    ]
    app.launch()
    app.tap()

    XCTAssertTrue(app.wait(for: .runningForeground, timeout: 10))
  }
}
