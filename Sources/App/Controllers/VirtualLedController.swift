import Vapor
import Fluent
import Leaf

struct MessageRequest: Content {
    var Data: String?
    var Kind: String?
    var TriggerName: String?
    var Timestamp: String?
    var DataId: String?
    var SenderId: String?
}

struct MessageResponse: Content {
    var Status: String
    var Error: String
}

struct GravioTriggerContext: Encodable {
    let title: String
    let gravioTriggers: [TriggerRecord]
}

struct VirtualLedController: RouteCollection {
    func boot(router: Router) throws {
        let ledRoutes = router.grouped("vLed")
        let apiLedRoutes = router.grouped("api", "vLed")
        ledRoutes.get("/", use: vLedHandler)
        apiLedRoutes.post("/", use: vLedApiHandler)
        apiLedRoutes.get(use: getAlltRecHandler)
        apiLedRoutes.get("/last", use: getLastTriggerRecordHandler)
    }
    
    func vLedHandler(_ req: Request) throws -> Future<View> {
        let formatter = DateFormatter()
        formatter.dateFormat = "dd/MM/yyyy HH:mm:ss a '00:00'"
        let yesterday = formatter.string(from: Calendar.current.date(byAdding: .day, value: -1, to: Date())!)
        return TriggerRecord.query(on: req).filter(\.Timestamp >= yesterday).sort(\.Timestamp, .descending).all().flatMap(to: View.self) { gravioTriggers in
            let context = GravioTriggerContext(title: "All Trigger Records", gravioTriggers: gravioTriggers)
            return try req.view().render("vLed", context)
        }
    }
    
    func vLedApiHandler(_ req: Request) throws -> Future<MessageResponse> {
        let decoded = try req.content.decode(MessageRequest.self)
        let futureResponse = decoded.map(to: MessageResponse.self) { newData in
            if(newData.Data == nil) || (newData.Kind == nil) || (newData.DataId == nil){
                return MessageResponse(Status: "Data Not Saved", Error: "Data, DataId & Kind Values Required")
            }
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
            formatter.timeZone = TimeZone.current
            let dateString = formatter.string(from: Date())
            let data = newData.Data ?? "0"
            let kind = newData.Kind ?? "0"
            let triggerName = newData.TriggerName ?? "Button press displays TriggerName"
            let timestamp = dateString
            let dataId = newData.DataId ?? "0"
            let senderId = newData.SenderId ?? "0"
            let dataToSave = TriggerRecord(
                Data: "\(data)", Kind: "\(kind)",
                TriggerName: "\(triggerName)", Timestamp: "\(timestamp)",
                DataId: "\(dataId)", SenderId: "\(senderId)"
            )
            _ = dataToSave.save(on: req)
            return MessageResponse(Status: "Data Saved", Error: "nil")
            }
        return futureResponse
    }
    
    func getAlltRecHandler(_ req: Request) throws -> Future<[TriggerRecord]> {
        var builder = TriggerRecord.query(on: req)
        if let Kind = req.query[String.self, at: "Kind"] {
            builder = builder.filter(\.Kind == Kind)
        }
        if let from = req.query[String.self, at: "from"] {
            let formatter = DateFormatter()
            formatter.dateFormat = "dd/MM/yyyy' 'H:mm:ss' 'a"
            guard let _ = formatter.date(from: from) else {
                print("Incorrect date format: from: " + from)
                throw Abort(.badRequest)
            }
            builder = builder.filter(\.Timestamp >= from)
        }
        return builder.sort(\.Timestamp, .ascending).all()
    }
    
    func getLastTriggerRecordHandler(_ req: Request) throws -> Future<[TriggerRecord]> {
        return req.withPooledConnection(to: .psql) { (conn) -> Future<[TriggerRecord]> in
            conn.raw("SELECT * FROM \"TriggerRecord\" ORDER BY \"Timestamp\" desc limit 1")
                .all(decoding: TriggerRecord.self)
        }
    }

}
