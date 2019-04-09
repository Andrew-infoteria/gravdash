import Foundation
import Vapor
import FluentPostgreSQL

final class GravioPuller: Content {
    var id: Int?
    var ipAddress: String
    var areaNames: String
    var layerNames: [String] = []
    var active: Bool
    var interval: Int
    
    init(ipAddress: String, areaNames: String, layerNames: [String], active: Bool, interval: Int) {
        self.ipAddress = ipAddress
        self.areaNames = areaNames
        self.layerNames = layerNames
        self.active = active
        self.interval = interval
    }
}

extension GravioPuller: Migration {}
extension GravioPuller: PostgreSQLModel {}
extension GravioPuller: Parameter {}
