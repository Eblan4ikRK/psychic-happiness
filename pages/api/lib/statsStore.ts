// /pages/api/lib/statsStore.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export interface StatsStore {
  logRequest(): Promise<void>;
  getStats(): Promise<{
    totalRequests: number;
    requestsPerSecond: number;
  }>;
}

class RedisStatsStore implements StatsStore {
  private readonly KEY = 'live:requests';
  private readonly WINDOW_SIZE = 1000; // 1 секунда

  async logRequest(): Promise<void> {
    const now = Date.now();
    await redis.zadd(this.KEY, now, now.toString());
    await redis.expire(this.KEY, 2); // TTL 2 секунды
  }

  async getStats(): Promise<{
    totalRequests: number;
    requestsPerSecond: number;
  }> {
    const now = Date.now();
    const cutoff = now - this.WINDOW_SIZE;
    
    // Удаляем старые записи
    await redis.zremrangebyscore(this.KEY, 0, cutoff);
    
    // Получаем текущее количество
    const count = await redis.zcard(this.KEY);
    
    return {
      totalRequests: count,
      requestsPerSecond: count
    };
  }
}

const statsStore: StatsStore = new RedisStatsStore();
export default statsStore;