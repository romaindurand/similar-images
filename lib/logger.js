export function log () {
  const isDebug = !!process.argv.find(arg => arg === 'debug')
  if (!isDebug) return
  console.log('DEBUG', ...arguments)
}
