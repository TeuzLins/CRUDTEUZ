import axios from 'axios'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../store/auth'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const authPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']

export const api = axios.create({ baseURL })

function isAuthRequest(url?: string) {
  return !!url && authPaths.some((path) => url.endsWith(path) || url.includes(path))
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && !isAuthRequest(config.url)) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` }
  }
  return config
})

let refreshing = false
let queue: Array<(t: string) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error.response?.status
    const original = error.config
    if (status === 401 && original && !original._retry && !isAuthRequest(original.url)) {
      original._retry = true
      const rt = getRefreshToken()
      if (!rt) {
        clearTokens()
        return Promise.reject(error)
      }
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push((t) => {
            original.headers = { ...(original.headers || {}), Authorization: `Bearer ${t}` }
            api(original).then(resolve).catch(reject)
          })
        })
      }
      refreshing = true
      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: rt })
        setTokens(data.accessToken, data.refreshToken)
        const t = data.accessToken
        queue.forEach((fn) => fn(t))
        queue = []
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${t}` }
        return api(original)
      } catch (e) {
        clearTokens()
        queue = []
        return Promise.reject(e)
      } finally {
        refreshing = false
      }
    }
    return Promise.reject(error)
  }
)
