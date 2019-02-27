import Foundation
import Vapor
import FluentPostgreSQL

final class Record: Codable {
    var id: UUID?
    var areaName: String
    var layerName: String
    var value: String
    var recordTime: String
    var senderId: String


    init(value: String, areaName: String, layerName: String, recordTime: String, senderId: String) {
        self.areaName = areaName
        self.layerName = layerName
        self.value = value
        self.recordTime = recordTime
        self.senderId = senderId
    }
}

extension Record: PostgreSQLUUIDModel {}
extension Record: Content {}
extension Record: Migration {}
extension Record: Parameter {}
