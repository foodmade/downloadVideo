const jedis = require('./jedis');
const Const = require('./const');


async function testRedis() {
    var redis = new jedis();
     var res = await redis.smembers('PUSH_TASK_QUEUE');
    console.log('获取到的值:' + JSON.stringify(res));

}

testRedis();