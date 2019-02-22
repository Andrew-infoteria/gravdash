import Vapor

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
        return Record.query(on: req).all()
    }

    func getHandler(_ req: Request) throws -> Future<Record> {
        return try req.parameters.next(Record.self)
    }

    func deleteHandler(_ req: Request) throws -> Future<HTTPStatus> {
        return try req.parameters.next(Record.self).delete(on: req).transform(to: HTTPStatus.noContent)
    }
}
