export default function debounceMaxWait(func, wait, maxWait) {
    let timer;
    let lastCall = Date.now()
    return function (...args) {
        const initialTime = Date.now();
        if (initialTime - lastCall >= maxWait) {
            clearTimeout(timer);
            lastCall = initialTime;
            func.apply(this, args)
        } else {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args)
                lastCall = Date.now()}, wait);
            return timer
        }
    }

}