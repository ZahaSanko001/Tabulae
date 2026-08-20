import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { SchemaCanvas } from './components/SchemaCanvas'
import { useIntrospectSchema } from './hooks/useIntrospectSchema'
import './App.css'

type DbType = 'postgres' | 'sqlserver' | 'mysql'

function App() {
  const [connectionString, setConnectionString] = useState('')
  const [dbType, setDbType] = useState<DbType>('postgres')
  const { snapshot, loading, error, introspect } = useIntrospectSchema()

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    await introspect(dbType, connectionString)
  }

/*   const placeholders: Record<string, string> = {
    postgres: "postgresql://user:password@localhost:5432/dbname",
    mysql: "mysql://user:password@localhost:3306/dbname",
    sqlserver: "Server=localhost;Database=dbname;User Id=user;Password=password;",
  }; */

  return (
    <main className="schema-page">
      <h1>Tabulae</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="connection-string">Connection string</label>
        <input
          id="connection-string"
          type="text"
          value={connectionString}
          onChange={(event) => setConnectionString(event.target.value)}
          placeholder="Enter a connection string"
        />
        <label htmlFor="db-type">Database type</label>
        <select
          id="db-type"
          value={dbType}
          onChange={(event) => setDbType(event.target.value as DbType)}
        >
          <option value="postgres">PostgreSQL</option>
          <option value="sqlserver">SQL Server</option>
          <option value="mysql">MySQL</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Connecting…' : 'Visualize schema'}
        </button>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </form>
      {snapshot && <SchemaCanvas snapshot={snapshot} />}
    </main>
  )
}

export default App
