import { useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function App() {
  const [connectionString, setConnectionString] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      const response = await fetch(`${apiUrl}/api/schema/introspect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString }),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const snapshot = await response.json()
      console.log(snapshot)
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
        <button type="submit">Load schema</button>
      </form>
    </main>
  )
}

export default App
