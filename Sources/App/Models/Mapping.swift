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


extension Mapping: PostgreSQLModel {}
extension Mapping: Migration {}
extension Mapping: Parameter {}
