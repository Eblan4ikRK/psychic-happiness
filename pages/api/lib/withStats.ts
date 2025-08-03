// /pages/api/lib/withStats.ts
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import statsStore from './statsStore';

export const withStats = (handler: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await statsStore.increment();
    return handler(req, res);
  };
};