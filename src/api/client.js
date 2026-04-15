/**
 * FastAPI backend client.
 * Base URL from env; token stored in localStorage.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function getToken() {
  return localStorage.getItem('edukids_token')
}

function setToken(token) {
  if (token) localStorage.setItem('edukids_token', token)
  else localStorage.removeItem('edukids_token')
}

export function getAuthHeaders() {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function apiFetch(path, options = {}) {
  const start = Date.now()
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  console.log(`[API START] ${options.method || 'GET'} ${url}`)
  
  const res = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  })
  
  const duration = Date.now() - start
  console.log(`[API END] ${options.method || 'GET'} ${path} - ${duration}ms`)

  if (res.status === 401) {
    setToken(null)
    const err = await res.json().catch(() => ({ detail: 'Not authorized' }))
    const e = new Error(err.detail || 'Not authorized')
    e.status = 401
    e.detail = err.detail
    throw e
  }
  if (!res.ok) {
    let detail = res.statusText
    try {
      const err = await res.json()
      detail = err.detail || err.message || res.statusText
    } catch {
      // res.json() failed, use statusText
    }
    console.error(`[API Error] ${res.status} ${url}:`, detail)
    const e = new Error(detail)
    e.status = res.status
    e.detail = detail
    throw e
  }
  if (res.status === 204) return null
  return res.json()
}

export { getToken, setToken, API_BASE }
