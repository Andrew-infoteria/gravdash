import Vapor

/// Register your application's routes here.
public func routes(_ router: Router) throws {
    let recordsController = RecordsController()
    try router.register(collection: recordsController)
    let websiteController = WebsiteController()
    try router.register(collection: websiteController)
    let settingsController = SettingsController()
    try router.register(collection: settingsController)
    let consoleController = ConsoleController()
    try router.register(collection: consoleController)
}
