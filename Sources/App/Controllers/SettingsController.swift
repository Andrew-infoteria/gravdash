import Vapor
import Leaf
import FluentPostgreSQL

struct AllMappingsContext: Encodable {
    let title: String
    var mappings: [Mapping]? = nil
    var senderIdsPanel: SenderIdPanelContext? = nil
    init(title: String) {
        self.title = title
    }
}

struct SenderIdPanelContext: Encodable {
    let senderIds: [Record]
}

struct DeleteMappingRequest :Content {
    var mappingId :Int
}

struct SettingsController: RouteCollection {
    func boot(router: Router) throws {
        let settingsRoutes = router.grouped("settings")
        settingsRoutes.get("/", use: allMappingsHandler)
        settingsRoutes.post(Mapping.self, at: "/createMap", use: createMappingPostHandler)
        settingsRoutes.post(DeleteMappingRequest.self, at: "/deleteMap", use: deleteMappingPostHandler)
    }
    
    func allMappingsHandler(_ req: Request) throws -> Future<View> {
       let distinctSenderId = req.withPooledConnection(to: .psql) { (conn) -> Future<[Record]> in
            conn.raw("SELECT DISTINCT ON(\"senderId\") * FROM \"Record\"")
                .all(decoding: Record.self)
        }
        let mappingFuture: Future<[Mapping]> = Mapping.query(on: req).all();
        return map(to: AllMappingsContext.self, distinctSenderId, mappingFuture) { senderIds, mappings in
            let senderIdsCtx = SenderIdPanelContext(senderIds: senderIds)
            var context = AllMappingsContext(title: "Settings")
            context.senderIdsPanel = senderIdsCtx
            context.mappings = mappings
            return context
        }.flatMap(to: View.self) { context in
            return try req.view().render("mapping", context)
        }
    }
    
    func createMappingPostHandler(_ req: Request, mapping: Mapping) throws -> Future<Response> {
        return mapping.save(on: req).catchMap { error in
            return mapping
            }.transform(to: req.redirect(to: "/settings"))
    }
    
    func deleteMappingPostHandler(_ req: Request, deleteRequest: DeleteMappingRequest) throws -> Future<Response> {
        return Mapping.query(on: req).filter(\.id == deleteRequest.mappingId) .first().unwrap(or :Abort(.badRequest)).delete(on: req) .transform(to :req.redirect(to: "/settings"))
    }
    
}
