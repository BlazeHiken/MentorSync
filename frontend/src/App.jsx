import { useState, useEffect } from 'react'

function App() {
  const [healthStatus, setHealthStatus] = useState(null)
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

  useEffect(() => {
    fetch(`${apiUrl}/api/health/`)
      .then(res => res.json())
      .then(data => setHealthStatus(data))
      .catch(err => setHealthStatus({ status: 'error', message: err.message }))
  }, [apiUrl])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>MentorSync Foundation</h1>
      <p>Frontend is running successfully.</p>

      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h2>Backend Health Check:</h2>
        {healthStatus ? (
          <pre>{JSON.stringify(healthStatus, null, 2)}</pre>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}

export default App
