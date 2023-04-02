const cache = require('./cache');

const firstSellOrder = cache.zrangebyscore(
  'sellOrderBook',
  0,
  'inf',
  'WITHSCORES',
  'LIMIT',
  0,
  1
);

const firstBuyOrder = cache.zrevrangebyscore(
  'buyOrderBook',
  'inf',
  0,
  'WITHSCORES',
  'LIMIT',
  0,
  1
);

(async () => {
  console.log(await firstSellOrder);
  console.log(await firstBuyOrder);
})();
