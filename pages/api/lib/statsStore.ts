// pages/api/lib/statsStore.ts
import Redis from 'ioredis';

// Настройка Redis
const redis = new Redis(process.env.REDIS_URL!);

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

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
    const member = `${now}-${Math.random()}`; // Уникальный member
    await redis.zadd(this.KEY, now, member);
    await redis.expire(this.KEY, 10); // TTL больше окна
  }

  async getStats(): Promise<{
    totalRequests: number;
    requestsPerSecond: number;
  }> {
    try {
      const now = Date.now();
      const cutoff = now - this.WINDOW_SIZE;

      // Удаляем старые записи
      await redis.zremrangebyscore(this.KEY, 0, cutoff);

      // Считаем оставшиеся
      const count = await redis.zcard(this.KEY);

      return {
        totalRequests: count,
        requestsPerSecond: count,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalRequests: 0,
        requestsPerSecond: 0,
      };
    }
  }
}

const statsStore: StatsStore = new RedisStatsStore();
export default statsStore;
