export default function throttle(func, delay) {
    let throttled = false;
    return function (...args) {
        if (!throttled) {
            func.apply(this, args);
            throttled = true;
            setTimeout(() => {
                throttled = false;
            }, delay)
        }
    }
}