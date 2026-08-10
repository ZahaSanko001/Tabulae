import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { SchemaCanvas } from './components/SchemaCanvas'
import type { SchemaSnapshot } from './types/schema'
import './App.css'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
type DbType = 'postgres' | 'sqlserver'

function App() {
  const [connectionString, setConnectionString] = useState('')
  const [dbType, setDbType] = useState<DbType>('postgres')
  const [snapshot, setSnapshot] = useState<SchemaSnapshot | null>(null)

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      const response = await fetch(`${apiUrl}/api/schema/introspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString, dbType }),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const nextSnapshot: SchemaSnapshot = await response.json()
      setSnapshot(nextSnapshot)
    } catch (error) {
      console.error('Unable to fetch schema:', error)
    }
  }

  return (
    <main className="schema-page">
      <h1>SchemaForge</h1>
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
        </select>
        <button type="submit">Load schema</button>
      </form>
      {snapshot && <SchemaCanvas snapshot={snapshot} />}
    </main>
  )
}

export default App
