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

struct GpullFormFilters: Content {
    var ipAdd: String
    var layerName: String?
}

struct GappapiRequest: Content {
    let OnlyNewest: Bool
    let LayerName: String
}

struct GappapiResponse: Content {
    struct ResultData: Codable {
        let AreaName: String
        let LayerName: String
        let DeviceName: String
        let LayerType: String
        let DataType: String
        let SenderId: String
        let Data: Int
        let Timestamp: String
        let DataId: String
        }
    let Result: [ResultData]
    let Message: String
}

struct ConsoleController: RouteCollection {
    func boot(router: Router) throws {
        let consoleRoutes = router.grouped("console")
        consoleRoutes.get("/", use: allConsoleHandler)
        consoleRoutes.get("/gpull", use: gappapiPullHandler)
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
    
    func gappapiPullHandler(_ req: Request) throws -> Future<Response>{
        let filters = try req.query.decode(GpullFormFilters.self)
        let ipAdd = filters.ipAdd
        let lyName = filters.layerName ?? ""
        print("IP Address: ",ipAdd)
        print("Layer Name: ",lyName)
        let reqBody = GappapiRequest(OnlyNewest: true, LayerName: "\(lyName)")
        // Mock API, still debugging certificate issue pulling from gravio
        let futureRes = try req.client().post("http://www.mocky.io/v2/5ca1cd693700006900899415"){ newReq in
            // encode the loginRequest before sending
            try newReq.content.encode(reqBody)
            }.flatMap { mockRes in
                // Decode Content after Response is received
                return try mockRes.content.decode(GappapiResponse.self)
            }.map(to: Record.self) { apiRes in
                // Map results to Record model
                let areaName = apiRes.Result[0].AreaName // nested objects in an array
                let layerName = apiRes.Result[0].LayerName
                let value = apiRes.Result[0].Data
                let type = apiRes.Result[0].DataType
                let recordTime = apiRes.Result[0].Timestamp
                let senderId = apiRes.Result[0].SenderId
                print("areaName: ",areaName)
                print("layerName: ",layerName)
                print("value: ",value)
                print("recordTime: ",recordTime)
                return Record(
                    value: "\(value)",
                    areaName: "\(areaName)",
                    layerName: "\(layerName)",
                    type: "\(type)",
                    recordTime: "\(recordTime)",
                    senderId: "\(senderId)"
                )
            }.flatMap { record in
                return record.save(on: req)
            }
        return futureRes .transform(to: req.redirect(to: "/console"))
    }

}

