/** Password rules, shown live under the field and enforced again on the server. */

export const MIN_LENGTH = 10

const COMMON = ['password', 'password1', '1234567890', 'qwertyuiop', 'iloveyou12', 'letmein123', 'welcome123', 'flow123456', 'admin12345']

export interface PasswordCheck {
  longEnough: boolean
  lettersAndNumbers: boolean
  notEmail: boolean
  notCommon: boolean
  ok: boolean
}

export function checkPassword(password: string, email = ''): PasswordCheck {
  const lower = password.toLowerCase()
  const local = email.split('@')[0]?.toLowerCase() ?? ''
  const longEnough = password.length >= MIN_LENGTH
  const lettersAndNumbers = /\p{L}/u.test(password) && /\d/.test(password)
  const notEmail = !email || (lower !== email.toLowerCase() && !(local.length >= 4 && lower.includes(local)))
  const notCommon = !COMMON.some((c) => lower.includes(c))
  return { longEnough, lettersAndNumbers, notEmail, notCommon, ok: longEnough && lettersAndNumbers && notEmail && notCommon }
}
