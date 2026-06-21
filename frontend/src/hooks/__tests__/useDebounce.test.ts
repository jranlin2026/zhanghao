/**
 * useDebounce.test.ts
 * 测试防抖 Hook 的延迟更新行为
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebounceFn } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初始值应与传入值相同', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('在延迟时间未到时不应更新值', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: '初始值', delay: 3000 } },
    );

    expect(result.current).toBe('初始值');

    // 更新值为新值
    rerender({ value: '新值', delay: 3000 });

    // 还未到 3 秒，应该还是旧值
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe('初始值');
  });

  it('在延迟时间到达后应更新为最新值', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: '初始值', delay: 3000 } },
    );

    expect(result.current).toBe('初始值');

    // 更新值为新值
    rerender({ value: '新值', delay: 3000 });

    // 快进 3 秒，应该更新为新值
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current).toBe('新值');
  });

  it('在延迟时间内再次更新值应重置计时器', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'A', delay: 3000 } },
    );

    // 更新为 B
    rerender({ value: 'B', delay: 3000 });

    // 过 2 秒后更新为 C（重置计时器）
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    rerender({ value: 'C', delay: 3000 });

    // 再等 2 秒（总共 4 秒，但 B 的计时器已重置），应该还是 A
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe('A');

    // 再等 1 秒到 C 的 3 秒延时完成
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe('C');
  });

  it('应使用默认延迟 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'v1' } },
    );

    rerender({ value: 'v2' });

    // 300ms 以内不应更新
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('v1');

    // 超过 300ms 应更新
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('v2');
  });
});

describe('useDebounceFn', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('应在延迟后调用函数', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceFn(fn, 1000));

    act(() => {
      result.current();
    });

    expect(fn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('在延迟时间内多次调用应只执行最后一次', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceFn(fn, 1000));

    act(() => {
      result.current('call-1');
      vi.advanceTimersByTime(500);
      result.current('call-2');
      vi.advanceTimersByTime(500);
      result.current('call-3');
    });

    // 还未到 1000ms 实际计时（每次都重置了），不应调用
    expect(fn).not.toHaveBeenCalled();

    // 等待最后一次调用的延时完成
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('call-3');
  });
});
