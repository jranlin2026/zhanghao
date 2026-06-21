import { useState, useEffect, useRef } from 'react';

/**
 * 防抖 Hook
 * 在指定延迟后更新值
 * @param value 需要防抖的值
 * @param delay 延迟毫秒数，默认 300ms
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖函数 Hook（用于回调场景）
 * @param fn 需要防抖的函数
 * @param delay 延迟毫秒数，默认 300ms
 */
export function useDebounceFn<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay = 300,
): (...args: Args) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFn = (...args: Args) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      fn(...args);
      timerRef.current = null;
    }, delay);
  };

  // 清理
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedFn;
}
