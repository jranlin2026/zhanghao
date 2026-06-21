/**
 * pagination.test.ts
 * 测试分页参数工具
 */
import { describe, it, expect } from 'vitest';
import { parsePagination, buildFindManyParams, wrapPaginatedResult } from '../../utils/pagination';

describe('parsePagination', () => {
  it('未传参数时应返回默认值', () => {
    const result = parsePagination({});
    expect(result).toEqual({
      skip: 0,
      take: 50,
      orderBy: { updated_at: 'desc' },
    });
  });

  it('page 为 1 时 skip 应为 0', () => {
    const result = parsePagination({ page: 1 });
    expect(result.skip).toBe(0);
  });

  it('page 为 2 时 skip 应为 pageSize', () => {
    const result = parsePagination({ page: 2, pageSize: 20 });
    expect(result.skip).toBe(20);
    expect(result.take).toBe(20);
  });

  it('page 为 3, pageSize 为 10 时 skip 应为 20', () => {
    const result = parsePagination({ page: 3, pageSize: 10 });
    expect(result.skip).toBe(20);
    expect(result.take).toBe(10);
  });

  it('pageSize 默认值应为 50', () => {
    const result = parsePagination({ page: 1 });
    expect(result.take).toBe(50);
  });

  it('page 小于 1 时应被修正为 1', () => {
    const result = parsePagination({ page: 0 });
    expect(result.skip).toBe(0);
    expect(result.take).toBe(50);

    const result2 = parsePagination({ page: -5 });
    expect(result2.skip).toBe(0);
  });

  it('pageSize 小于 1 时应被修正为 1', () => {
    const result = parsePagination({ pageSize: 0 });
    expect(result.take).toBe(1);

    const result2 = parsePagination({ pageSize: -10 });
    expect(result2.take).toBe(1);
  });

  it('pageSize 超过 100 时应被限制为 100', () => {
    const result = parsePagination({ pageSize: 200 });
    expect(result.take).toBe(100);
  });

  describe('orderBy', () => {
    it('未传 sortBy 时应默认按 updated_at desc 排序', () => {
      const result = parsePagination({});
      expect(result.orderBy).toEqual({ updated_at: 'desc' });
    });

    it('传入 sortBy 时应按指定字段排序', () => {
      const result = parsePagination({ sortBy: 'created_at' });
      expect(result.orderBy).toEqual({ created_at: 'asc' });
    });

    it('应支持自定义排序方向', () => {
      const result = parsePagination({ sortBy: 'name', sortOrder: 'desc' });
      expect(result.orderBy).toEqual({ name: 'desc' });
    });
  });
});

describe('buildFindManyParams', () => {
  it('应返回 skip, take, orderBy 和 where', () => {
    const result = buildFindManyParams({ page: 2, pageSize: 20 });
    expect(result).toHaveProperty('skip', 20);
    expect(result).toHaveProperty('take', 20);
    expect(result).toHaveProperty('orderBy');
    expect(result).toHaveProperty('where');
  });

  it('不传 where 时应为 undefined', () => {
    const result = buildFindManyParams({});
    expect(result.where).toBeUndefined();
  });

  it('应透传 where 条件', () => {
    const where = { status: '启用中' };
    const result = buildFindManyParams({ page: 1 }, where);
    expect(result.where).toEqual(where);
  });
});

describe('wrapPaginatedResult', () => {
  it('应包装数据为带分页信息的结果', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const result = wrapPaginatedResult(data, 50, 1, 20);

    expect(result).toEqual({
      data: [{ id: 1 }, { id: 2 }],
      pagination: { page: 1, pageSize: 20, total: 50 },
    });
  });

  it('空数据时应正确包装', () => {
    const result = wrapPaginatedResult([], 0, 1, 20);

    expect(result).toEqual({
      data: [],
      pagination: { page: 1, pageSize: 20, total: 0 },
    });
  });

  it('最后一页时应正确计算', () => {
    const data = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
    const result = wrapPaginatedResult(data, 55, 6, 10);

    expect(result.pagination).toEqual({ page: 6, pageSize: 10, total: 55 });
    expect(result.data).toHaveLength(10);
  });
});
