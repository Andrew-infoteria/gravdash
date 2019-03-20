import Vapor
import Leaf
import FluentPostgreSQL

struct AllMappingsContext: Encodable {
    let title: String
    let mappings: [Mapping]
    let today: String
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
        let displayFormatter = DateFormatter()
        displayFormatter.dateFormat = "dd MMM"
        let today = displayFormatter.string(from :Date())
        return Mapping.query(on: req).all().flatMap(to: View.self) { mappings in
            let context = AllMappingsContext(title: "Mapping Settings", mappings: mappings, today: today)
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
