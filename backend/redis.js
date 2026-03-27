import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_URL;
const localHost = process.env.REDIS_HOST || '127.0.0.1';
const localPort = process.env.REDIS_PORT || 6379;

let redisClient;

const redisOptions = {
    // Increase stability by disabling the crash-inducing retry limit
    maxRetriesPerRequest: null,
    // Smooth back-off strategy for reconnections
    retryStrategy: (times) => {
        const delay = Math.min(times * 200, 5000);
        return delay;
    },
    // Reconnect on certain errors automatically
    reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    }
};

if (redisUrl) {
    redisClient = new Redis(redisUrl, {
        ...redisOptions,
        tls: { rejectUnauthorized: false }
    });
} else {
    redisClient = new Redis({
        ...redisOptions,
        host: localHost,
        port: localPort,
    });
}

redisClient.on('connect', () => {
    console.log(`✅ Redis connected successfully: ${redisUrl ? 'Upstash' : 'Local'}`);
});

redisClient.on('error', (err) => {
    if (err.code === 'ENOTFOUND') {
        console.warn('⚠️ DNS Lookup failed for Redis. Backend will continue locally but check your internet connection or .env config.');
    } else if (err.code === 'ECONNREFUSED') {
        console.warn('⚠️ Redis Connection Refused. Ensure your Redis server is running.');
    } else {
        console.error('❌ Redis error:', err.message);
    }
});

export { redisClient };
