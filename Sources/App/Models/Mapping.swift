import Foundation
import Vapor
import FluentPostgreSQL

final class Mapping: Content {
    var id: Int?
    var senderId: String
    var tag: String

    
    init(senderId: String, tag: String) {
        self.senderId = senderId
        self.tag = tag
    }
}

extension Mapping: Migration {
    public static func prepare(on connection: PostgreSQLConnection) -> Future<Void> {
        return Database.create(self, on: connection) { builder in
            try addProperties(to: builder)
            builder.unique(on: \.senderId)
        }
    }
}

extension Mapping: PostgreSQLModel {}
extension Mapping: Parameter {}
