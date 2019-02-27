import Vapor
import Fluent
import Leaf

struct WebsiteController: RouteCollection {
    func boot(router: Router) throws {
        router.get(use: dashboardHandler)
        router.get("records", use: allRecordsHandler)
    }

    func dashboardHandler(_ req: Request) throws -> Future<View> {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        let yesterday = formatter.string(from: Calendar.current.date(byAdding: .day, value: -1, to: Date())!)
        return flatMap(
            Record.query(on: req).filter(\.type == "Temperature").filter(\.recordTime >= yesterday).sort(\.recordTime, .ascending).all(),
            Record.query(on: req).filter(\.type == "Button press").filter(\.recordTime >= yesterday).sort(\.recordTime, .ascending).all()
        ) { temperatures, buttonPresses in
            let context = DashboardContext(title: "Dashboard", temperatures: temperatures, buttonPresses: buttonPresses)
            return try req.view().render("index", context)
        }
    }

    func allRecordsHandler(_ req: Request) throws -> Future<View> {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        let yesterday = formatter.string(from: Calendar.current.date(byAdding: .day, value: -1, to: Date())!)
        return Record.query(on: req).filter(\.recordTime >= yesterday).sort(\.recordTime, .descending).all().flatMap(to: View.self) { records in
            let context = AllRecordsContext(title: "All Records", records: records)
            return try req.view().render("allRecords", context)
        }
    }
}

struct DashboardContext: Encodable {
    let title: String
    let temperatures: [Record]
    let buttonPresses: [Record]
}

struct AllRecordsContext: Encodable {
    let title: String
    let records: [Record]
}
