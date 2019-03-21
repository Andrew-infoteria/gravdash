import Vapor
import Fluent
import Leaf

struct WebsiteController: RouteCollection {
    func boot(router: Router) throws {
        router.get(use: dashboardHandler)
        router.get("records", Record.parameter, use: recordHandler)
        router.get("records", use: allRecordsHandler)
    }

    func dashboardHandler(_ req: Request) throws -> Future<View> {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        let yesterday = formatter.string(from: Calendar.current.date(byAdding: .day, value: -1, to: Date())!)
        let threedays = formatter.string(from: Calendar.current.date(byAdding: .day, value: -3, to: Date())!)
        let week = formatter.string(from: Calendar.current.date(byAdding: .day, value: -7, to: Date())!)

        let temperatureFuture: Future<[Record]> = Record.query(on: req).filter(\.type == "Temperature").filter(\.recordTime >= yesterday).sort(\.recordTime, .ascending).all()
        let humidityFuture: Future<[Record]> = Record.query(on: req).filter(\.type == "Humidity").filter(\.recordTime >= yesterday).sort(\.recordTime, .ascending).all()
        let buttonPressFuture: Future<[Record]> = Record.query(on: req).filter(\.type == "Button press").filter(\.recordTime >= threedays).sort(\.recordTime, .ascending).all()
        let doorStateFuture: Future<[Record]> = Record.query(on: req).filter(\.type == "Door state").filter(\.recordTime >= week).sort(\.recordTime, .ascending).all()
        let occupancyFuture: Future<[Record]> = Record.query(on: req).filter(\.type == "Motion Detected").filter(\.recordTime >= yesterday).sort(\.recordTime, .ascending).all()
        let officePeopleFuture: Future<[Record]> = Record.query(on: req).filter(\.type == "NumberOfPeople").filter(\.recordTime >= yesterday).sort(\.recordTime, .ascending).all()
        let vibrationFuture: Future<[Record]> = Record.query(on: req).group(.or) { $0.filter(\.type == "Ready").filter(\.type == "Tilt").filter(\.type == "Drop") }.filter(\.recordTime >= threedays).sort(\.recordTime, .ascending).all()
        let mappingFuture: Future<[Mapping]> = Mapping.query(on: req).all();

        return map(to: DashboardContext.self, temperatureFuture, humidityFuture, buttonPressFuture, doorStateFuture, occupancyFuture) { temperatures, humidities, buttonPresses, doorStates, occupancies in
            
            let values = temperatures.map({ Float($0.value)! })
            let min = String(format: "%.2f", values.isEmpty ? 0 : values.min()!)
            let max = String(format: "%.2f", values.isEmpty ? 0 : values.max()!)
            let average = String(format: "%.2f", values.isEmpty ? 0 : values.reduce(0, +) / Float(values.count))
            let tempCtx = TemperaturePanelContext(temperatures: temperatures, min: min, max: max, average: average)
            let humidCtx = HumidityPanelContext(humidities: humidities)
            let btnCtx = ButtonPressPanelContext(buttonPresses: buttonPresses)
            let doorCtx = DoorStatePanelContext(doorStates: doorStates)
            let occupCtx = OccupancyPanelContext(occupancies: occupancies)
            var context = DashboardContext(title: "Dashboard")
            context.temperaturePanel = tempCtx
            context.humidityPanel = humidCtx
            context.buttonPressPanel = btnCtx
            context.doorStatePanel = doorCtx
            context.occupancyPanel = occupCtx
            
            return context
        }.flatMap(to: DashboardContext.self) { dashboard in
            var context = dashboard
            return map(officePeopleFuture, vibrationFuture, mappingFuture) {officePeople, vibrations, mappings in
                let offPplCtx = OfficePeoplePanelContext(officePeople: officePeople)
                let vibrateCtx = VibrationPanelContext(vibrations: vibrations)
                context.officePeoplePanel = offPplCtx
                context.vibrationPanel = vibrateCtx
                context.mappings = mappings
                
                let displayFormatter = DateFormatter()
                displayFormatter.dateFormat = "dd MMM"
                let today = displayFormatter.string(from :Date())
                let todayCtx = TodayDateContext(today: today)
                context.todayDate = todayCtx
                return context
            }

        }.flatMap(to: View.self) { context in
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
}

struct DashboardContext: Encodable {
    let title: String
    var todayDate: TodayDateContext? = nil
    var temperaturePanel: TemperaturePanelContext? = nil
    var humidityPanel: HumidityPanelContext? = nil
    var buttonPressPanel: ButtonPressPanelContext? = nil
    var doorStatePanel: DoorStatePanelContext? = nil
    var occupancyPanel: OccupancyPanelContext? = nil
    var officePeoplePanel: OfficePeoplePanelContext? = nil
    var vibrationPanel: VibrationPanelContext? = nil
    var mappings: [Mapping]? = nil

    init(title: String) {
        self.title = title
    }
}

struct TodayDateContext: Encodable {
    let today: String
}

struct TemperaturePanelContext: Encodable {
    let temperatures: [Record]
    let min: String
    let max: String
    let average: String
}

struct HumidityPanelContext: Encodable {
    let humidities: [Record]
}

struct ButtonPressPanelContext: Encodable {
    let buttonPresses: [Record]
}

struct DoorStatePanelContext: Encodable {
    let doorStates: [Record]
}

struct OccupancyPanelContext: Encodable {
    let occupancies: [Record]
}

struct OfficePeoplePanelContext: Encodable {
    let officePeople: [Record]
}

struct VibrationPanelContext: Encodable {
    let vibrations: [Record]
}

struct RecordContext: Encodable {
    let title: String
    let record: Record
}

struct AllRecordsContext: Encodable {
    let title: String
    let records: [Record]
}

struct DeleteRequest: Content {
    let mappingId: Int
}
