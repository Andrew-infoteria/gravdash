import Foundation
import Vapor
import FluentPostgreSQL

final class Record: Codable {
    var id: UUID?
    var value: String
    var recordTime: String

    init(value: String, recordTime: String) {
        self.value = value
        self.recordTime = recordTime
    }
}

extension Record: PostgreSQLUUIDModel {}
extension Record: Content {}
extension Record: Migration {}
extension Record: Parameter {}
