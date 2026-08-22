// client/src/App.tsx
import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { SchemaCanvas } from './components/SchemaCanvas'
import { useIntrospectSchema } from './hooks/useIntrospectSchema'
import './App.css'

type DbType = 'postgres' | 'sqlserver' | 'mysql' | 'sqlite'

const PLACEHOLDERS: Record<DbType, string> = {
  postgres: 'postgresql://user:password@localhost:5432/dbname',
  mysql: 'mysql://user:password@localhost:3306/dbname',
  sqlserver: 'Server=localhost;Database=dbname;User Id=user;Password=password;',
  sqlite: '/path/to/database.db',
}

function App() {
  const [connectionString, setConnectionString] = useState('')
  const [dbType, setDbType] = useState<DbType>('postgres')
  const { snapshot, loading, error, introspect } = useIntrospectSchema()

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    await introspect(dbType, connectionString)
  }

  return (
    <main className="schema-page">
      {!snapshot && (
        <div className="schema-hero">
          <p className="schema-hero__eyebrow">
            <span className="schema-hero__prompt">$</span> npx @raiyankarim/tabulae
            <span className="schema-hero__cursor" aria-hidden="true" />
          </p>
          <h1>Tabulae</h1>
          <p className="schema-hero__subtitle">
            Point it at a database. Get a live, explorable schema diagram back — nothing leaves your machine.
          </p>
        </div>
      )}

      <div className="terminal-window">
        <div className="terminal-window__titlebar">
          <span className="terminal-window__dot terminal-window__dot--red" />
          <span className="terminal-window__dot terminal-window__dot--amber" />
          <span className="terminal-window__dot terminal-window__dot--green" />
          <span className="terminal-window__title">tabulae — connect</span>
        </div>

        <form className="terminal-window__body" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="db-type" className="field__label">// database engine</label>
            <select
              id="db-type"
              value={dbType}
              onChange={(event) => setDbType(event.target.value as DbType)}
            >
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="sqlserver">SQL Server</option>
              <option value="sqlite">SQLite</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="connection-string" className="field__label">
              // {dbType === 'sqlite' ? 'database file path' : 'connection string'}
            </label>
            <div className="field__prompt-input">
              <span className="field__prompt-marker">&gt;</span>
              <input
                id="connection-string"
                type="text"
                value={connectionString}
                onChange={(event) => setConnectionString(event.target.value)}
                placeholder={PLACEHOLDERS[dbType]}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Connecting…' : (
              <>
                Visualize schema <span className="button__arrow">›</span>
              </>
            )}
          </button>

          {error && <p className="schema-error">✕ {error}</p>}
        </form>
      </div>

      {snapshot && <SchemaCanvas snapshot={snapshot} />}
    </main>
  )
}

export default App