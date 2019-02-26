//
//  DateTimeTag.swift
//  App
//
//  Created by NG Chun Ying on 26/2/2019.
//

import Foundation
import Vapor

final class DateTimeTag: TagRenderer {
    init() { }

    func render(tag: TagContext) throws -> EventLoopFuture<TemplateData> {
        try tag.requireParameterCount(1)
        let string = tag.parameters[0].string ?? ""
        let formatter = DateFormatter()
        formatter.timeZone = TimeZone(abbreviation: "GMT")
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSS'Z'"
        let date = formatter.date(from: string);
        formatter.timeZone = TimeZone.current
        formatter.dateFormat = "dd MMMM yyyy, h:mm a"
        return tag.container.future(.string(formatter.string(from: date!)))
    }
}
