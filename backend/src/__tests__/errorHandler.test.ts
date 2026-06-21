import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import { errorHandler } from '../middleware/errorHandler';

describe('errorHandler', () => {
  it('maps unique constraint errors to conflict responses', () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: ['imei'] },
    });

    errorHandler(error, {} as never, response as never, vi.fn());

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({ code: 409, data: null, message: '数据已存在，请检查唯一字段' });
  });
  it('maps foreign key errors to bad request responses', () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const error = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
      code: 'P2003',
      clientVersion: 'test',
      meta: { field_name: 'phone_number_id' },
    });

    errorHandler(error, {} as never, response as never, vi.fn());

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({ code: 400, data: null, message: '绑定的数据不存在，请检查关联关系' });
  });
});
