import Vapor
import Fluent
import Leaf

struct AllConsoleContext: Encodable {
    let title: String
    var mappings: [Mapping]? = nil
    var senderIdsPanel: SenderIdPanelContext? = nil
    init(title: String) {
        self.title = title
    }
}

struct ConsoleController: RouteCollection {
    func boot(router: Router) throws {
        let consoleRoutes = router.grouped("console")
        consoleRoutes.get("/", use: allConsoleHandler)
    }

    func allConsoleHandler(_ req: Request) throws -> Future<View> {
        let distinctSenderId = req.withPooledConnection(to: .psql) { (conn) -> Future<[Record]> in
            conn.raw("SELECT DISTINCT ON(\"senderId\") * FROM \"Record\"")
                .all(decoding: Record.self)
        }
        let mappingFuture: Future<[Mapping]> = Mapping.query(on: req).all();
        return map(to: AllConsoleContext.self, distinctSenderId, mappingFuture) { senderIds, mappings in
            let senderIdsCtx = SenderIdPanelContext(senderIds: senderIds)
            var context = AllConsoleContext(title: "Console")
            context.senderIdsPanel = senderIdsCtx
            context.mappings = mappings
            return context
        }.flatMap(to: View.self) { context in
                return try req.view().render("allConsole", context)
        }
    }
    
}

