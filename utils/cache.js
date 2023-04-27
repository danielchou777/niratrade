import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const cache =
  process.env.CACHE_ENV === 'production'
    ? new Redis({
        port: process.env.REDIS_PORT, // Redis port
        host: process.env.REDIS_HOST, // Redis host
        username: process.env.REDIS_USERNAME, // needs Redis >= 6
        password: process.env.REDIS_PASSWORD,
        retryStrategy: (times) => {
          // reconnect after 5 seconds for the first 10 attempts,
          // then increase the delay by 1 second for every subsequent attempt
          const delay = times <= 10 ? 1000 : 1000 * (times - 10);
          return delay;
        },
        tls: {},
      })
    : new Redis({
        port: process.env.REDIS_PORT, // Redis port
        host: process.env.REDIS_HOST, // Redis host
        username: process.env.REDIS_USERNAME, // needs Redis >= 6
        password: process.env.REDIS_PASSWORD,
        retryStrategy: (times) => {
          // reconnect after 5 seconds for the first 10 attempts,
          // then increase the delay by 1 second for every subsequent attempt
          const delay = times <= 10 ? 1000 : 1000 * (times - 10);
          return delay;
        },
      });

export default cache;
