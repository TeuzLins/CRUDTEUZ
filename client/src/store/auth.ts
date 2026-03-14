const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
const REMEMBER_KEY = 'auth_remember'

function resolveStorage() {
  const remember = (localStorage.getItem(REMEMBER_KEY) || 'true') === 'true'
  return remember ? localStorage : sessionStorage
}

export function setTokens(accessToken: string, refreshToken?: string) {
  clearTokens()
  const store = resolveStorage()
  store.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) store.setItem(REFRESH_KEY, refreshToken)
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_KEY) || localStorage.getItem(ACCESS_KEY) || ''
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_KEY) || localStorage.getItem(REFRESH_KEY) || ''
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
}

export function setRememberPreference(remember: boolean) {
  localStorage.setItem(REMEMBER_KEY, String(remember))
}

export function getRememberPreference() {
  return (localStorage.getItem(REMEMBER_KEY) || 'true') === 'true'
}
