import Foundation
import Vapor
import FluentPostgreSQL

final class TriggerRecord: Codable {
    var id: UUID?
    var Data: String
    var Kind: String
    var TriggerName: String
    var Timestamp: String
    var DataId: String
    var SenderId: String
    
    init(Data: String, Kind: String, TriggerName: String, Timestamp: String, DataId: String, SenderId: String) {
        self.Data = Data
        self.Kind = Kind
        self.TriggerName = TriggerName
        self.Timestamp = Timestamp
        self.DataId = DataId
        self.SenderId = SenderId
    }
}

extension TriggerRecord: PostgreSQLUUIDModel {}
extension TriggerRecord: Content {}
extension TriggerRecord: Migration{
    public static func prepare(on connection: PostgreSQLConnection) -> Future<Void> {
        return Database.create(self, on: connection) { builder in
            try addProperties(to: builder)
            builder.unique(on: \.DataId)
        }
    }
}
extension TriggerRecord: Parameter {}
