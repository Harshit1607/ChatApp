export const Throttle = (cb, delay) => {
  let last = 0;

  return (...args) => {
    const now = Date.now()
    if(now - last < delay) return
    last = now;
    return cb(...args)
  }
}