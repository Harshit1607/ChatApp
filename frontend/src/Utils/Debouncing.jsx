export const Debouncing = (cb, delay)=>{
  let timer;
  return (...args) => {
    if(timer) clearTimeout(timer)
      
    timer = setTimeout(() => {
      cb(...args)
    }, delay);
  }
}