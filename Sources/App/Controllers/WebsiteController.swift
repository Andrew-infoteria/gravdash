import Vapor
import Fluent
import Leaf

struct WebsiteController: RouteCollection {
    func boot(router: Router) throws {
        router.get(use: dashboardHandler)
        router.get("records", Record.parameter, use: recordHandler)
        router.get("records", use: allRecordsHandler)
        router.get("mapping", use: allMappingsHandler)
        router.post(Mapping.self, at: "create-mapping", use: createMappingPostHandler)
        router.post(DeleteRequest.self, at: "mapping") { request, deleteRequest -> Future<Response> in
            return Mapping.query(on: request).filter(\.id == deleteRequest.mappingId) .first().unwrap(or :Abort(.badRequest)).delete(on: request) .transform(to :request.redirect(to: "mapping"))
        }
    }

    func dashboardHandler(_ req: Request) throws -> Future<View> {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        let yesterday = formatter.string(from: Calendar.current.date(byAdding: .day, value: -1, to: Date())!)
        let threedays = formatter.string(from: Calendar.current.date(byAdding: .day, value: -3, to: Date())!)
        return flatMap(
            Record.query(on: req).filter(\.type == "Door state").filter(\.recordTime >= yesterday).sort(\.recordTime, .descending).first().unwrap(or :Abort(.badRequest)),
            Record.query(on: req).filter(\.senderId == "A7-24-A2-02-00-8D-15-00").filter(\.recordTime >= yesterday).sort(\.recordTime, .descending).first().unwrap(or :Abort(.badRequest)),
            Record.query(on: req).filter(\.type == "Temperature").filter(\.recordTime >= yesterday).sort(\.recordTime, .ascending).all(),
            Record.query(on: req).filter(\.type == "Button press").filter(\.recordTime >= threedays).sort(\.recordTime, .ascending).all(),
            Mapping.query(on: req).all()
        ) { doors, vibrations, temperatures, buttonPresses, mappings in
            let door = doors.value
            let vibration = vibrations.value
            //let vvalues = vibrations.map({ Float($0.value)! })
            //let last = String(format: "%.2f", vvalues.isEmpty ? 0 : vvalues.min()!)
            let values = temperatures.map({ Float($0.value)! })
            let min = String(format: "%.2f", values.isEmpty ? 0 : values.min()!)
            let max = String(format: "%.2f", values.isEmpty ? 0 : values.max()!)
            let average = String(format: "%.2f", values.isEmpty ? 0 : values.reduce(0, +) / Float(values.count))
            let context = DashboardContext(title: "Dashboard", door: door, vibration: vibration, temperatures: temperatures, min: min, max: max, average: average, buttonPresses: buttonPresses, mappings: mappings)
            return try req.view().render("index", context)
        }
    }

    func recordHandler(_ req: Request) throws -> Future<View> {
        return try req.parameters.next(Record.self).flatMap(to: View.self) { record in
            let context = RecordContext(title: record.type, record: record)
            return try req.view().render("record", context)
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
        return Mapping.query(on: req).all().flatMap(to: View.self) { mappings in
            let context = AllMappingsContext(title: "Settings", mappings: mappings)
            return try req.view().render("mapping", context)
        }
    }

    func createMappingPostHandler(_ req: Request, mapping: Mapping) throws -> Future<Response> {
        return mapping.save(on: req).catchMap { error in
            return mapping
        }.transform(to: req.redirect(to: "/mapping"))
    }
}

struct DashboardContext: Encodable {
    let title: String
    let door: String
    let vibration: String
    let temperatures: [Record]
    let min: String
    let max: String
    let average: String
    let buttonPresses: [Record]
    let mappings: [Mapping]
}

struct RecordContext: Encodable {
    let title: String
    let record: Record
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
