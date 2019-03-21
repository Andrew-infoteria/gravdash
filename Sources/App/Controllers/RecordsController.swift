import Vapor
import Fluent

struct RecordsController: RouteCollection {
    func boot(router: Router) throws {
        let recordsRoutes = router.grouped("api", "records")
        recordsRoutes.post(Record.self, use: createHandler)
        recordsRoutes.get(use: getAllHandler)
        recordsRoutes.get(Record.parameter, use: getHandler)
        recordsRoutes.delete(Record.parameter, use: deleteHandler)
    }

    func createHandler(_ req: Request, record: Record) -> Future<Record> {
        return record.create(on: req).catchFlatMap { error in
            return record.save(on: req)
        }
    }

    func getAllHandler(_ req: Request) throws -> Future<[Record]> {
        var builder = Record.query(on: req)
        if let from = req.query[String.self, at: "from"] {
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
            guard let _ = formatter.date(from: from) else {
                print("Incorrect date format: from: " + from)
                throw Abort(.badRequest)
            }
            builder = builder.filter(\.recordTime >= from)
        }
        if let to = req.query[String.self, at: "to"] {
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
            guard let _ = formatter.date(from: to) else {
                print("Incorrect date format: to: " + to)
                throw Abort(.badRequest)
            }
            builder = builder.filter(\.recordTime <= to)
        }
        return builder.sort(\.recordTime, .ascending).all()
    }

    func getHandler(_ req: Request) throws -> Future<Record> {
        return try req.parameters.next(Record.self)
    }

    func deleteHandler(_ req: Request) throws -> Future<HTTPStatus> {
        return try req.parameters.next(Record.self).delete(on: req).transform(to: HTTPStatus.noContent)
    }
}
