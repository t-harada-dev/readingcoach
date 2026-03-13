import XCTest

final class SurfaceSnapshotUITests: XCTestCase {
  private var app: XCUIApplication!
  private var interruptionToken: NSObjectProtocol?

  override func setUpWithError() throws {
    continueAfterFailure = false
    app = XCUIApplication()
    interruptionToken = InterruptionHandling.installSystemAlertMonitor()
  }

  override func tearDownWithError() throws {
    app = nil
    interruptionToken = nil
  }

  private func assertSurfaceReady(_ snapshotId: String) {
    app.launchArguments = ["-e2e_surface_snapshot", snapshotId]
    app.launch()
    app.tap()

    XCTAssertTrue(app.otherElements["surface-snapshot-ready-\(snapshotId)"].waitForExistence(timeout: 10))
    XCTAssertTrue(app.otherElements["surface-snapshot-ready"].waitForExistence(timeout: 10))
  }

  func testSurfaceSF01WidgetNormal() throws { assertSurfaceReady("SF-01") }
  func testSurfaceSF02WidgetRehab() throws { assertSurfaceReady("SF-02") }
  func testSurfaceSF03NotificationNormal() throws { assertSurfaceReady("SF-03") }
  func testSurfaceSF04NotificationRehab() throws { assertSurfaceReady("SF-04") }
  func testSurfaceSF05LiveActivity15m() throws { assertSurfaceReady("SF-05") }
  func testSurfaceSF06LiveActivity3m() throws { assertSurfaceReady("SF-06") }
  func testSurfaceSF07LiveActivity1m() throws { assertSurfaceReady("SF-07") }
  func testSurfaceSF08AppIntents() throws { assertSurfaceReady("SF-08") }
  func testSurfaceSF09LiveActivity5m() throws { assertSurfaceReady("SF-09") }
}
