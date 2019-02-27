import Vapor
import Fluent
import Leaf

struct WebsiteController: RouteCollection {
    func boot(router: Router) throws {
        router.get(use: dashboardHandler)
        router.get("records", use: allRecordsHandler)
        router.get("mapping", use: allMappingsHandler)
        router.post(Mapping.self, at: "create-mapping") { request, mapping -> Future<Response> in
            return mapping.save(on: request)
            .transform(to: request.redirect(to: "mapping"))
        }
        router.post(DeleteRequest.self, at: "mapping") { request, deleteRequest -> Future<Response> in
            return Mapping.query(on: request).filter(\.id == deleteRequest.mappingId) .first().unwrap(or :Abort(.badRequest)).delete(on: request) .transform(to :request.redirect(to: "mapping"))
        }
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
        return Record.query(on: req).filter(\.recordTime >= yesterday).sort(\.recordTime, .descending).all().flatMap(to: View.self) { records in
            let context = AllRecordsContext(title: "All Records", records: records)
            return try req.view().render("allRecords", context)
        }
    }
    
    func allMappingsHandler(_ req: Request) throws -> Future<View> {
        //let distinctModels = req.withPooledConnection(to: .psql) { (conn) -> Future<[Record]> in
        //    conn.raw("\"select distinct \"senderId\" from \"Record\";\"")
        //       .all(decoding: Record.self)
        //}
        return Mapping.query(on: req).all().flatMap(to: View.self) { mappings in
            let context = AllMappingsContext(title: "Mapping Settings", mappings: mappings)
            return try req.view().render("mapping", context)
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

struct AllMappingsContext: Encodable {
    let title: String
    let mappings: [Mapping]
}

struct DeleteRequest: Content {
    let mappingId: Int
}
