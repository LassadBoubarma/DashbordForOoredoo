import { useState, useEffect } from 'react';

/**
 * A custom hook to sync state with localStorage.
 * @param {string} key - The key in localStorage.
 * @param {any} initialValue - The default value.
 */
export function usePersistentState(key, initialValue) {
    const [value, setValue] = useState(() => {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}
