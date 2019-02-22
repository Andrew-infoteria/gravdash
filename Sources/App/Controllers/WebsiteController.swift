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
        return Record.query(on: req).filter(\.recordTime >= yesterday).sort(\.recordTime, .ascending).all().flatMap(to: View.self) { records in
            let context = DashboardContext(title: "Dashboard", records: records)
            return try req.view().render("index", context)
        }
    }

    func allRecordsHandler(_ req: Request) throws -> Future<View> {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        let yesterday = formatter.string(from: Calendar.current.date(byAdding: .day, value: -1, to: Date())!)
        return Record.query(on: req).filter(\.recordTime >= yesterday).sort(\.recordTime, .ascending).all().flatMap(to: View.self) { records in
            let context = AllRecordsContext(title: "All Records", records: records)
            return try req.view().render("allRecords", context)
        }
    }
}

struct DashboardContext: Encodable {
    let title: String
    let records: [Record]
}

struct AllRecordsContext: Encodable {
    let title: String
    let records: [Record]
}
