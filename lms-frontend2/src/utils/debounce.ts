export default function debounce(fn: any, delay = 250) {
    let timeout: any;

    return (...args: any) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}