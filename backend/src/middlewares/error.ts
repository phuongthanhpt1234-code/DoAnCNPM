import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';

export const ah =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ', issues: err.issues });
  }
  if (err?.code === '23503') return res.status(400).json({ message: 'Tham chiếu tới dữ liệu không tồn tại' });
  if (err?.code === '23505') return res.status(409).json({ message: 'Dữ liệu đã tồn tại' });
  console.error(err);
  res.status(500).json({ message: 'Lỗi máy chủ' });
}
