import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * 敏感信息 30 秒自动恢复脱敏定时器 Hook
 *
 * 功能：
 * - startTimer(seconds)：启动倒计时，自动脱敏
 * - resetTimer()：重置倒计时
 * - stopTimer()：立即停止并恢复脱敏
 * - timeLeft：剩余秒数
 * - isMasked：是否处于脱敏状态
 */
export function useSensitiveTimer(initialMasked = true) {
  const [isMasked, setIsMasked] = useState(initialMasked);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number>(0);

  /** 清除定时器 */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** 启动倒计时 */
  const startTimer = useCallback(
    (seconds: number = 30) => {
      // 清除旧定时器
      clearTimer();

      setIsMasked(false);
      setTimeLeft(seconds);
      endTimeRef.current = Date.now() + seconds * 1000;

      // 每秒更新剩余时间
      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearTimer();
          setIsMasked(true);
        }
      }, 200); // 200ms 刷新一次，更精确
    },
    [clearTimer],
  );

  /** 重置定时器 */
  const resetTimer = useCallback(
    (seconds: number = 30) => {
      startTimer(seconds);
    },
    [startTimer],
  );

  /** 立即停止并恢复脱敏 */
  const stopTimer = useCallback(() => {
    clearTimer();
    setIsMasked(true);
    setTimeLeft(0);
  }, [clearTimer]);

  /** 组件卸载时清除定时器 */
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    isMasked,
    timeLeft,
    startTimer,
    resetTimer,
    stopTimer,
  };
}
