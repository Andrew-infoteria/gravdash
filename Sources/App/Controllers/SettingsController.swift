import Vapor
import Leaf
import FluentPostgreSQL
import Jobs

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

struct GpullFormFilters: Content { //req struct for manualPuller
    var leafIpAddress: String
    var leafAreaName: String?
    var leafLayerName: String?
    var leafDataType: String?
    var leafSenderId: String?
    var leafDateFrom: String?
    var leafDateTo: String?
    //var active: Bool
}

struct GappapiRequest: Content { //req struct for autoPuller
    let OnlyNewest: Bool
    let AreaName: String
    let LayerName: String
}

struct GappapiResponse: Content { //res struct from gappapi
    struct ResultData: Codable {
        let AreaName: String
        let LayerName: String
        let DeviceName: String
        let LayerType: String
        let DataType: String
        let SenderId: String
        let Data: Double
        let Timestamp: String
        let DataId: String
    }
    let Result: [ResultData]
    let Message: String
}

struct AllGpullContext: Encodable {
    let title: String
    var todayDate: TodayDateContext? = nil
    var gpulls: [GravioPuller]? = nil
    var activePulls: [GravioPuller]? = nil
    init(title: String) {
        self.title = title
    }
    }

struct DeleteGpullRequest :Content {
    var gpullId :Int
}

struct SettingsController: RouteCollection {
    func boot(router: Router) throws {
        let settingsRoutes = router.grouped("settings")
        settingsRoutes.get("/", use: allMappingsHandler)
        settingsRoutes.post(Mapping.self, at: "/createMap", use: createMappingPostHandler)
        settingsRoutes.post(DeleteMappingRequest.self, at: "/deleteMap", use: deleteMappingPostHandler)
        settingsRoutes.get("/manualgpull", use: manualGpullHandler)
        settingsRoutes.post(GravioPuller.self, at: "/createGpull", use: createGpullPostHandler)
        settingsRoutes.get("/gpull", use: allGpullHandler)
        settingsRoutes.post(DeleteGpullRequest.self, at: "/deleteGpull", use: deleteGpullPostHandler)
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
    
    func manualGpullHandler(_ req: Request) throws -> Future<Response>{
        //Get form values
        let filters = try req.query.decode(GpullFormFilters.self)
        let ipAddress = filters.leafIpAddress
        let areaName = filters.leafAreaName ?? ""
        let layerName = filters.leafLayerName ?? ""
        let dataType = filters.leafDataType ?? ""
        let senderId = filters.leafSenderId ?? ""
        let dateFrom = filters.leafDateFrom ?? ""
        let dateTo = filters.leafDateTo ?? ""
        print("Form filters: ipAddress=",ipAddress,"&areaName=",areaName,"&layerName=",layerName,"&dataType=",dataType,"&senderId=",senderId,"&dateFrom=",dateFrom,"&dateTo=",dateTo)
        
        let headers: HTTPHeaders = [
            "Content-Type": "application/json",
            "cache-control": "no-cache"
        ]
        //DateFrom format: 2019-04-05T07:09:10.1979658Z
        let body = HTTPBody(string: """
            {
                "OnlyNewest": false,
                "AreaName": "\(areaName)",
                "LayerName": "\(layerName)",
                "DataType": "\(dataType)",
                "SenderId": "\(senderId)",
                "DateFrom": "\(dateFrom)",
                "DateTo" : "\(dateTo)"
            }
            """)
        // tested code for gravio app, but unable to decode text/plain content-type
       /* let httpReq = HTTPRequest(
            method: .POST,
            url: URL(string: "/gappapi")!,
            headers: headers,
            body: body)
        let client = HTTPClient.connect(scheme: .customHTTPS(.forClient(certificateVerification: .none)), hostname: "\(ipAdd)", port: 29444, on: req)  */
        //for test only code
        let httpReq = HTTPRequest(
            method: .POST,
            url: URL(string: "/v2/5caaf7933000000b1790473e")!, // multi result url: /v2/5caaf7933000000b1790473e
            headers: headers,
            body: body)
        let client = HTTPClient.connect(hostname: "www.mocky.io", on: req)
        //print("manual httpReq: ",httpReq) //to see req
        let httpRes = client.flatMap(to: HTTPResponse.self) { client in
            return client.send(httpReq)
        }
        let decoded = httpRes.flatMap(to: GappapiResponse.self) { httpResponse in
            let response = Response(http: httpResponse, using: req)
            print("manual response: ",response)
            return try response.content.decode(GappapiResponse.self)
            }
        
        let futureRecordData = decoded.map(to: String.self) { apiRes in
            // Map results to Record model
            for i in 0 ..< apiRes.Result.count {
                let areaName = apiRes.Result[i].AreaName // nested objects in an array
                let layerName = apiRes.Result[i].LayerName
                let value = apiRes.Result[i].Data
                let convertedValue = Int(exactly: apiRes.Result[i].Data)
                let type = apiRes.Result[i].DataType
                let recordTime = apiRes.Result[i].Timestamp
                let senderId = apiRes.Result[i].SenderId
                let dataId = apiRes.Result[i].DataId
              
                print("areaName: ",areaName)
                print("layerName: ",layerName)
                if convertedValue != nil {
                    print("value: ",convertedValue!)
                    let singleRecord = Record(
                        value: "\(convertedValue!)",
                        areaName: "\(areaName)",
                        layerName: "\(layerName)",
                        type: "\(type)",
                        recordTime: "\(recordTime)",
                        senderId: "\(senderId)"
                    )
                    _=singleRecord.save(on: req)
                    
                } else {
                    print("value: ",value)
                    let singleRecord = Record(
                        value: "\(value)",
                        areaName: "\(areaName)",
                        layerName: "\(layerName)",
                        type: "\(type)",
                        recordTime: "\(recordTime)",
                        senderId: "\(senderId)"
                    )
                    _=singleRecord.save(on: req)
                    
                }
                print("recordTime: ",recordTime)
                print("dataId: ",dataId)
                print(" ")
            }
            return "Record all saved"
            }
        
        print("futureRecordData: ",futureRecordData)
        return httpRes .transform(to: req.redirect(to: "/settings/gpull"))
    }
    
    func createGpullPostHandler(_ req: Request, gpull: GravioPuller) throws -> Future<Response> {
        return gpull.save(on: req).catchMap { error in
            return gpull
            }.transform(to: req.redirect(to: "/settings/gpull"))
    }
    
    func allGpullHandler(_ req: Request) throws -> Future<View> {
        let activePullFuture: Future<[GravioPuller]> = GravioPuller.query(on: req).filter(\.active == true).all()
        let distinctLayerName = req.withPooledConnection(to: .psql) { (conn) -> Future<[Record]> in
            conn.raw("SELECT DISTINCT ON (\"layerName\",\"areaName\") * FROM \"Record\" ORDER BY \"areaName\"")
                .all(decoding: Record.self)
        }
        let gpullFuture: Future<[GravioPuller]> = GravioPuller.query(on: req).all();
        return map(to: AllGpullContext.self, activePullFuture, distinctLayerName, gpullFuture) { activepulls, dtlayernames, gpulls in
            let activePulls = activepulls.map({$0.active})
            //let jobId: [Int] = gpulls.map({$0.id!})
            let activeJobId: [Int] = activepulls.map({$0.id!})
            //let ipAddresses = activepulls.map({$0.ipAddress})
            let areaNames = activepulls.map({$0.areaNames})
            let intervals = activepulls.map({$0.interval})
            //print("activeJobId: ",activeJobId)
            //let dtlayerNames = dtlayernames.map({$0.layerName})
            //let jobs = "MyJobs\(jobId[i])"
            let headers: HTTPHeaders = [
                "Content-Type": "application/json",
                "cache-control": "no-cache"
            ]
            var activeGroup = [String]()
            
            // test switch case function
            //let someString: String = "AutoPuller22"
            //print(someString)
            /*switch someString {
            case "AutoPuller22", "AutoPuller23":
                print("\(someString) is active")
            default:
                print("\(someString) is not active")
            } */
            
            //end of test
            
            let formatter = DateFormatter()
            formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
            for i in 0 ..< activePulls.count {
                let job = Jobs.add(name: "AutoPuller\(activeJobId[i])", interval: intervals[i].seconds, autoStart: false) {
                    let minuteAgo = formatter.string(from: Calendar.current.date(byAdding: .second, value: -intervals[i], to: Date())!)
                    let body = HTTPBody(string: """
                        {"AreaName":"\(areaNames[i])",
                        "DateFrom":"\(minuteAgo)"}
                        """)
                    // for testing
                    let httpReq = HTTPRequest(
                        method: .POST,
                        url: URL(string: "/v2/5caabf42300000f8139045e4")!,
                        headers: headers,
                        body: body)
                    let client = HTTPClient.connect(scheme: .customHTTPS(.forClient(certificateVerification: .none)), hostname: "http://www.mocky.io", on: req)
                    // actual code for gappapi
                    /*let httpReq = HTTPRequest(
                        method: .POST,
                        url: URL(string: "/gappapi")!,
                        headers: headers,
                        body: body)
                    let client = HTTPClient.connect(scheme: .customHTTPS(.forClient(certificateVerification: .none)), hostname: "\(ipAddresses[i])", port: 29444, on: req)  */
                    let httpRes = client.flatMap(to: HTTPResponse.self) { client in
                        return client.send(httpReq)
                    }
                    //print("URL: \(ipAddresses[i]):29444/gappapi")
                    //print("HTTPRequestBody \(i+1): ",httpReq)
                    print(httpRes)
                }
                activeGroup.append(job.name!)
                job.stop()
            }
            //print(activeGroup)
            var context = AllGpullContext(title: "All Gpulls")
            context.activePulls = activepulls
            context.gpulls = gpulls
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
            let today = displayFormatter.string(from :Date())
            let todayCtx = TodayDateContext(today: today)
            context.todayDate = todayCtx
            return context
        }.flatMap(to: View.self) { context in
            return try req.view().render("gpull", context)
        }
    }
    
    func deleteGpullPostHandler(_ req: Request, deleteRequest: DeleteGpullRequest) throws -> Future<Response> {
        return GravioPuller.query(on: req).filter(\.id == deleteRequest.gpullId) .first().unwrap(or :Abort(.badRequest)).delete(on: req) .transform(to :req.redirect(to: "/settings/gpull"))
    }
    
}
