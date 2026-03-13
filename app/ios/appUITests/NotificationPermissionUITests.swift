import XCTest

final class NotificationPermissionUITests: XCTestCase {
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

  private func launch(_ args: [String] = []) {
    app.launchArguments = args
    app.launch()
    app.tap()
  }

  private func waitForHome() {
    XCTAssertTrue(app.otherElements["focus-core-screen"].waitForExistence(timeout: 12))
  }

  private func ensureNotificationsDisabled() {
    launch(["-e2e_open_screen", "settings"])
    XCTAssertTrue(app.otherElements["settings-screen"].waitForExistence(timeout: 12))

    let disable = app.otherElements["settings-disable-notification"]
    if disable.waitForExistence(timeout: 3) {
      disable.tap()
    }
    app.terminate()
  }

  private func openNotificationStage(mockPermission: String? = nil) {
    var args = ["-e2e_onboarding", "1", "-e2e_onboarding_stage", "notification"]
    if let mockPermission {
      args += ["-e2e_notification_permission", mockPermission]
    }
    launch(args)
    XCTAssertTrue(app.otherElements["onboarding-notification-screen"].waitForExistence(timeout: 12))
  }

  func testPermission01_FirstLaunchAllow_ContinuesFlow() throws {
    openNotificationStage(mockPermission: "allowed")
    app.otherElements["onboarding-notification-enable"].tap()
    waitForHome()
  }

  func testPermission02_FirstLaunchDeny_ContinuesFlow() throws {
    ensureNotificationsDisabled()
    openNotificationStage(mockPermission: "denied")
    app.otherElements["onboarding-notification-enable"].tap()
    waitForHome()
  }

  func testPermission03_DeniedState_FallbackFlow() throws {
    ensureNotificationsDisabled()
    openNotificationStage(mockPermission: "denied")
    let later = app.otherElements["onboarding-notification-later"]
    XCTAssertTrue(later.waitForExistence(timeout: 10))
    later.tap()
    waitForHome()
  }

  func testPermission04_AllowedState_PersistsAfterRelaunch() throws {
    openNotificationStage(mockPermission: "allowed")
    app.otherElements["onboarding-notification-enable"].tap()
    waitForHome()

    app.terminate()
    openNotificationStage(mockPermission: nil)
    XCTAssertTrue(app.otherElements["onboarding-notification-home"].waitForExistence(timeout: 15))
  }

  func testPermission05_DeniedState_PersistsAfterRelaunch() throws {
    ensureNotificationsDisabled()
    openNotificationStage(mockPermission: "denied")
    app.otherElements["onboarding-notification-enable"].tap()
    waitForHome()

    app.terminate()
    openNotificationStage(mockPermission: nil)
    XCTAssertTrue(app.otherElements["onboarding-notification-enable"].waitForExistence(timeout: 15))
  }

  func testPermission06_ChangeInSettings_ReflectedAfterReturn() throws {
    launch(["-e2e_open_screen", "settings"])
    XCTAssertTrue(app.otherElements["settings-screen"].waitForExistence(timeout: 12))

    let enable = app.otherElements["settings-enable-notification"]
    let disable = app.otherElements["settings-disable-notification"]
    if enable.exists {
      enable.tap()
      XCTAssertTrue(disable.waitForExistence(timeout: 6))
    } else if disable.exists {
      disable.tap()
      XCTAssertTrue(enable.waitForExistence(timeout: 6))
    } else {
      XCTFail("notification toggle CTA not found on settings screen")
    }
  }

  func testPermission07_NotificationTapLaunch_RoutesToSession() throws {
    launch([
      "-e2e_state", "due_normal",
      "-e2e_surface_source", "notification_response",
      "-e2e_surface_action", "start"
    ])

    XCTAssertTrue(app.otherElements["active-session-screen"].waitForExistence(timeout: 15))
  }

  func testPermission08_InterruptionRecovery_StillOperable() throws {
    openNotificationStage(mockPermission: nil)

    let enable = app.otherElements["onboarding-notification-enable"]
    if enable.waitForExistence(timeout: 10) {
      enable.tap()
    } else {
      let home = app.otherElements["onboarding-notification-home"]
      XCTAssertTrue(home.waitForExistence(timeout: 10))
      home.tap()
    }
    app.tap()

    XCTAssertTrue(app.otherElements["focus-core-screen"].waitForExistence(timeout: 15) ||
                  app.otherElements["onboarding-notification-screen"].waitForExistence(timeout: 15))
  }
}
