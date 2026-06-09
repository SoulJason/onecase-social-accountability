import { useEffect, useState } from 'react';

const useDebounce = (initialValue = '', delay: number) => {
  const [actualValue, setActualValue] = useState(initialValue);
  const [debounceValue, setDebounceValue] = useState(initialValue);
  const [debouncing, setDebouncing] = useState(false);

  useEffect(() => {
    if (debounceValue !== actualValue) {
      setDebouncing(true);
      const debounceId = setTimeout(() => {
        setDebounceValue(actualValue);
        setDebouncing(false);
      }, delay);
      return () => clearTimeout(debounceId);
    } else {
      setDebouncing(false);
    }
  }, [actualValue, delay]);

  return { state: [debounceValue, setActualValue] as const, debouncing };
};

export default useDebounce;
