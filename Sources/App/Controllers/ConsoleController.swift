import Vapor
import Fluent
import Leaf
import HTTP

struct AllConsoleContext: Encodable {
    let title: String
    var mappings: [Mapping]? = nil
    var senderIdsPanel: SenderIdPanelContext? = nil
    init(title: String) {
        self.title = title
    }
}

struct LoginRequest: Content {
    var cod: String
    var message: Float
    var cnt: Int
    var list: String
    var email: String
    var password: String
}

struct User: Content {
    var name: String
    var email: String
}

struct ConsoleController: RouteCollection {
    func boot(router: Router) throws {
        let consoleRoutes = router.grouped("console")
        consoleRoutes.get("/", use: allConsoleHandler)
        consoleRoutes.get("/mpush", use: microbotPushHandler)
        consoleRoutes.post("login", use: loginHandler)
        consoleRoutes.get("/user", use: userHandler)
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
    
    func microbotPushHandler(_ req: Request) throws -> Future<Response>{

        let client = try req.make(Client.self)
        let res = try client.post("https://o1.prota.space/mib/do/press?_id=dee6863098e2b3ca0eb6dedab207090d")
        print(res)
        return res .transform(to: req.redirect(to: "/console"))
    }
    
    //test
    func loginHandler (_ req: Request) throws -> Future<HTTPStatus> {
        return try req.content.decode(LoginRequest.self).map(to: HTTPStatus.self) { loginRequest in
            print(loginRequest.cod) //
            print(loginRequest.message) //
            //print(loginRequest.list) // nested objects??
            print(loginRequest.email) //
            print(loginRequest.password) //
            return .ok
        }
    }
    
    func userHandler (_ req: Request) throws -> User{
        return User(
            name: "Vapor User",
            email: "user@vapor.codes"
        )
    }
}

