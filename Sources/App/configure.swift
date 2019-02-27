import Vapor
import Leaf
import FluentPostgreSQL

/// Called before your application initializes.
public func configure(_ config: inout Config, _ env: inout Environment, _ services: inout Services) throws {
    // Register providers first
    let serverConfiure = NIOServerConfig.default(hostname: "0.0.0.0")
    services.register(serverConfiure)
    try services.register(FluentPostgreSQLProvider())
    try services.register(LeafProvider())

    // Register routes to the router
    let router = EngineRouter.default()
    try routes(router)
    services.register(router, as: Router.self)

    // Register middleware
    var middlewares = MiddlewareConfig() // Create _empty_ middleware config
     middlewares.use(FileMiddleware.self) // Serves files from `Public/` directory
    middlewares.use(ErrorMiddleware.self) // Catches errors and converts to HTTP response
    services.register(middlewares)

    // Configure a SQLite database
    let host: String
    let databaseName: String
    let databasePort: Int
    if (env == .testing) {
        host = "localhost"
        databaseName = "gravdash-test"
        databasePort = 5433
    } else {
        host = Environment.get("DATABASE_HOSTNAME") ?? "localhost"
        databaseName = Environment.get("DATABASE_DB") ?? "gravdash"
        databasePort = 5432
    }
    let databaseConfig = PostgreSQLDatabaseConfig(
        hostname: host,
        port: databasePort,
        username: "gravdash",
        database: databaseName,
        password: "password")
    let psql = PostgreSQLDatabase(config: databaseConfig)

    // Register the configured SQLite database to the database config.
    var databases = DatabasesConfig()
    databases.add(database: psql, as: .psql)
    services.register(databases)

    // Configure migrations
    var migrations = MigrationConfig()
    migrations.add(model: Record.self, database: .psql)
    migrations.add(model: Mapping.self, database: .psql)
    services.register(migrations)

    var commandConfig = CommandConfig.default()
    commandConfig.useFluentCommands()
    services.register(commandConfig)

    services.register { container -> LeafTagConfig in
        var config = LeafTagConfig.default()
        config.use(DateTimeTag(), as: "datetimeStr")
        return config
    }

    config.prefer(LeafRenderer.self, for: ViewRenderer.self)
}
