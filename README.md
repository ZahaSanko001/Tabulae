# Tabulae

Tabulae is a database schema visualization tool. Connect it to a PostgreSQL, MySQL, SQLite, or SQL Server database and explore its tables, columns, primary keys, foreign keys, and relationships as an interactive diagram.

The application includes:

- An interactive React and React Flow schema canvas
- PostgreSQL, MySQL, and SQL Server schema introspection
- SQLite database-file introspection
- Automatic table layout with relationship edges
- Table search and relationship-neighborhood focus
- Expandable table nodes
- Fullscreen canvas mode
- PNG, SVG, and Mermaid export
- A local Express API and a packaged command-line application

## Quick start with npm

The published package is [`@raiyankarim/tabulae`](https://www.npmjs.com/package/@raiyankarim/tabulae).

Run it without installing globally:

```bash
npx @raiyankarim/tabulae
```

Or install it globally:

```bash
npm install -g @raiyankarim/tabulae
tabulae
```

Tabulae starts a local server at [http://localhost:3000](http://localhost:3000) and attempts to open it in your browser automatically. If the browser does not open, visit the URL manually.

> The npm package runs locally. Your database connection string is sent from the browser to the local Tabulae server; Tabulae does not require a hosted account.

## Using the application

1. Start Tabulae with `npx` or the globally installed `tabulae` command.
2. Choose `PostgreSQL` or `SQL Server`.
3. Enter a connection string that the machine running Tabulae can reach.
4. Select **Visualize schema**.
5. Use the canvas controls to pan, zoom, and inspect the diagram.

After a schema is loaded, you can:

- Search for a table by name.
- Select a table to show its connected neighborhood, with a depth of one to three hops.
- Hover over a table to highlight its direct relationships.
- Expand or collapse table columns.
- Enter or leave fullscreen mode.
- Export the current diagram as PNG, SVG, or Mermaid.

## Connection strings

### PostgreSQL

Use a standard PostgreSQL connection URI:

```text
postgresql://USER:PASSWORD@HOST:5432/DATABASE
```

Example:

```text
postgresql://postgres:postgres@localhost:5432/demo
```

The PostgreSQL provider reads tables and columns from `information_schema`, identifies primary keys and foreign keys, and excludes the `pg_catalog` and `information_schema` schemas.

### SQL Server

Use a SQL Server connection string:

```text
Server=HOST,1433;Database=DATABASE;User Id=USER;Password=PASSWORD;TrustServerCertificate=True;Encrypt=False
```

Example for a local development database:

```text
Server=localhost,1433;Database=demo;User Id=sa;Password=YourStrongPassword123!;TrustServerCertificate=True;Encrypt=False
```

The SQL Server provider reads user tables from `INFORMATION_SCHEMA` and `sys` catalog views, identifies primary keys and foreign keys, and excludes system tables.

### MySQL

Use a standard MySQL connection URI:

```text
mysql://USER:PASSWORD@HOST:3306/DATABASE
```

Example for the included Docker database:

```text
mysql://root:mysql@localhost:3306/demo
```

The MySQL provider reads the active database from `information_schema`, including primary keys, foreign keys, and relationship schemas.

### SQLite

Use the path to a SQLite database file as the connection string. For example:

```text
C:\path\to\demo.sqlite
```

The SQLite provider reads user tables from `sqlite_master`, including primary keys, foreign keys, and relationships.

## Screenshots

### Empty state

![Tabulae empty state](./docs/screenshots/01-empty-state.png)

### Schema overview

![Tabulae schema overview](./docs/screenshots/02-schema-overview.png)

### Search and focus mode

![Tabulae search and focus mode](./docs/screenshots/03-search-and-focus.png)

## API

The local server exposes one endpoint:

```http
POST http://localhost:3000/api/schema/introspect
Content-Type: application/json
```

Request body:

```json
{
  "dbType": "postgres",
  "connectionString": "postgresql://postgres:postgres@localhost:5432/demo"
}
```

For SQLite, use `"dbType": "sqlite"` and pass the database file path.

A successful response has this shape:

```json
{
  "tables": [
    {
      "schema": "public",
      "name": "users",
      "columns": [
        {
          "name": "id",
          "dataType": "integer",
          "isNullable": false,
          "isPrimaryKey": true,
          "isForeignKey": false
        }
      ]
    }
  ],
  "relationships": [
    {
      "fromSchema": "public",
      "fromTable": "orders",
      "fromColumn": "user_id",
      "toSchema": "public",
      "toTable": "users",
      "toColumn": "id"
    }
  ]
}
```

The endpoint is intended for local use. Do not expose it, keep the protection of database credentials in mind.

## Optional local databases with Docker

The repository includes PostgreSQL, MySQL, and SQL Server services in `docker-compose.yaml`:

```bash
docker compose up -d
```

The default development values are:

| Database | Host | Port | Database | User | Password |
| --- | --- | ---: | --- | --- | --- |
| PostgreSQL | `localhost` | `5432` | `demo` | `postgres` | `postgres` |
| MySQL | `localhost` | `3306` | `demo` | `root` | `mysql` |
| SQL Server | `localhost` | `1433` | `demo` | `sa` | `YourStrongPassword123!` |

The matching connection strings are shown above and are also available in [`server.rest`](./server.rest). The database containers may take a little longer to become ready after they start. The MySQL init script creates `users` and `orders` tables with a foreign key for testing.

Stop the services with:

```bash
docker compose down
```

Add `-v` only if you also want to remove the database volumes and their data:

```bash
docker compose down -v
```

## Project structure

```text
.
├── client/                 React + TypeScript + Vite frontend
│   └── src/
│       ├── components/     Canvas, table nodes, search, and export controls
│       ├── hooks/          API and schema-introspection hooks
│       ├── types/          Shared frontend schema types
│       └── utils/          Layout, graph, adjacency, and export helpers
├── server/                 Express + TypeScript backend and npm package
│   └── src/
│       ├── domain/         Schema snapshot types
│       ├── providers/      PostgreSQL, SQL Server, and provider selection
│       └── routes/         HTTP API routes
├── docker-compose.yaml     Optional local PostgreSQL and SQL Server services
├── server.rest             Example API requests
└── package.json             npm workspace scripts
```

## Security notes

- Treat database connection strings as secrets when they contain passwords or tokens.
- Use a least-privileged database account for introspection.
- Keep Tabulae bound to localhost unless you have secured the API and deployment environment.
- The PostgreSQL connection is configured with `default_transaction_read_only=on`; the provider only runs metadata queries.
- Review your SQL Server permissions and network exposure separately before using it against production data.

## License

The npm package currently declares the ISC license. See [`server/package.json`](./server/package.json) for the package metadata.

## Repository

[GitHub: ZahaSanko001/Tabulae](https://github.com/ZahaSanko001/Tabulae)


