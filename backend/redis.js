import Redis from 'ioredis';

const redisClient = new Redis(process.env.UPSTASH_REDIS_URL, {
  tls: { rejectUnauthorized: false }, // Required for Upstash Redis
});

redisClient.on('connect', () => {
  console.log('✅ Upstash Redis connected successfully.');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export { redisClient };
