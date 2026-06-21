/**
 * response.test.ts
 * 测试统一 API 响应格式工具
 */
import { describe, it, expect, vi } from 'vitest';
import type { Response } from 'express';
import { success, fail, notFound, forbidden, unauthorized, serverError } from '../../utils/response';

/** 创建一个模拟的 Express Response 对象 */
function createMockRes() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { status, json } as unknown as Response & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> };
}

describe('success', () => {
  it('应返回 200 状态码和标准成功格式', () => {
    const res = createMockRes();
    success(res, { id: 1, name: 'test' });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.status().json).toHaveBeenCalledWith({
      code: 200,
      data: { id: 1, name: 'test' },
      message: 'success',
    });
  });

  it('应支持自定义 message', () => {
    const res = createMockRes();
    success(res, [], '操作成功');

    expect(res.status().json).toHaveBeenCalledWith({
      code: 200,
      data: [],
      message: '操作成功',
    });
  });

  it('传入分页信息时应包含 pagination 字段', () => {
    const res = createMockRes();
    const pagination = { page: 1, pageSize: 20, total: 100 };
    success(res, [{ id: 1 }], 'success', pagination);

    expect(res.status().json).toHaveBeenCalledWith({
      code: 200,
      data: [{ id: 1 }],
      message: 'success',
      pagination: { page: 1, pageSize: 20, total: 100 },
    });
  });

  it('不传分页信息时不应包含 pagination 字段', () => {
    const res = createMockRes();
    success(res, null);

    const callArg = res.status().json.mock.calls[0][0];
    expect(callArg).not.toHaveProperty('pagination');
  });

  it('应支持 data 为 null', () => {
    const res = createMockRes();
    success(res, null);

    expect(res.status().json).toHaveBeenCalledWith({
      code: 200,
      data: null,
      message: 'success',
    });
  });
});

describe('fail', () => {
  it('应返回 400 状态码和标准错误格式', () => {
    const res = createMockRes();
    fail(res, '参数错误');

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.status().json).toHaveBeenCalledWith({
      code: 400,
      data: null,
      message: '参数错误',
    });
  });

  it('应支持自定义 code', () => {
    const res = createMockRes();
    fail(res, '未找到资源', 404);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.status().json).toHaveBeenCalledWith({
      code: 404,
      data: null,
      message: '未找到资源',
    });
  });

  it('应支持自定义 data', () => {
    const res = createMockRes();
    fail(res, '验证失败', 422, { field: 'email', error: '格式不正确' });

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.status().json).toHaveBeenCalledWith({
      code: 422,
      data: { field: 'email', error: '格式不正确' },
      message: '验证失败',
    });
  });
});

describe('notFound', () => {
  it('应返回 404', () => {
    const res = createMockRes();
    notFound(res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.status().json).toHaveBeenCalledWith({
      code: 404,
      data: null,
      message: '资源未找到',
    });
  });

  it('应支持自定义 message', () => {
    const res = createMockRes();
    notFound(res, '设备不存在');

    expect(res.status().json).toHaveBeenCalledWith({
      code: 404,
      data: null,
      message: '设备不存在',
    });
  });
});

describe('forbidden', () => {
  it('应返回 403', () => {
    const res = createMockRes();
    forbidden(res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.status().json).toHaveBeenCalledWith({
      code: 403,
      data: null,
      message: '权限不足',
    });
  });
});

describe('unauthorized', () => {
  it('应返回 401', () => {
    const res = createMockRes();
    unauthorized(res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.status().json).toHaveBeenCalledWith({
      code: 401,
      data: null,
      message: '未认证',
    });
  });
});

describe('serverError', () => {
  it('应返回 500', () => {
    const res = createMockRes();
    serverError(res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.status().json).toHaveBeenCalledWith({
      code: 500,
      data: null,
      message: '服务器内部错误',
    });
  });
});
