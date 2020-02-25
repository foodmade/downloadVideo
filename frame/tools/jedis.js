const redis      = require("redis");
const config     = require('../config/config');
const logger     = require('../config/log');
const Promise    = require('es6-promise').Promise;

const bluebird   = require('bluebird');
bluebird.promisifyAll(redis);

class jedis{

    constructor() {
        if(!jedis.single){
            this.jedisClient = null;
            this.init();
            jedis.single = this;
        }
        return jedis.single;
    }

    init(){
        this.jedisClient = redis.createClient(config.redis.port,config.redis.host,config.redis.options);
        logger.info(`Redis client init load successful.`);
        this.jedisClient.on("error", function(err) {
            logger.err(`Redis error: ${err}`);
        });
    }

    /**
     * Sadd value
     * @param key
     * @param value
     */
    async sadd(key,value){
        if(!key || key === ''){
            logger.err(`Redis sadd key must not empty`);
        }
        this.jedisClient.saddAsync(key,value);
    }

    /**
     * 获取集合长度
     * @param key
     * @returns {*}
     */
    async scard(key){
       return this.jedisClient.scardAsync(key).then(function (number) {
            return number;
       });
    }

    /**
     * 随机返回集合中的一个元素并删除
     * @param key
     * @returns {*}
     */
    async spop(key){
        return this.jedisClient.spopAsync(key).then(function (value) {
            return value;
        })
    }

    /**
     * 随机返回集合中的一个元素
     * @returns {Promise<void>}
     */
    async srandmember(key){
        return this.jedisClient.srandmemberAsync(key).then(function (value) {
            return value;
        })
    }

    /**
     * 返回集合所有成员
     * @param key
     * @returns {*}
     */
    async smembers(key){
        return this.jedisClient.smembersAsync(key).then(function (list) {
            return list;
        })
    }

    /**
     * Set value
     * @param key
     * @param value
     */
    async set(key,value){
        if(!key || key === ''){
            logger.err(`Redis set key must not empty`);
            return;
        }
        this.jedisClient.setAsync(key,value);
    }

    /**
     * Get value
     * @param key
     * @returns {Promise<*>}
     */
    async get(key) {
        return this.jedisClient.getAsync(key).then(function(value) {
            return value;
        });
    }

    /**
     * Delete key.
     * @param key
     * @returns {Promise<*>}
     */
    async del(key){
        return this.jedisClient.delAsync(key);
    }

}

jedis.single = null;
module.exports = jedis;