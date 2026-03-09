import FingerprintJS from '@fingerprintjs/fingerprintjs'

export async function identifyDevice() {
  // 1. Initialize the agent on application startup
  const fpPromise = FingerprintJS.load()

  // 2. Get the visitor identifier when you need it
  const fp = await fpPromise
  const result = await fp.get()

  // 3. Use the visitorId
  const visitorId = result.visitorId

  return visitorId
}