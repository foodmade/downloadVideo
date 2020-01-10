const request = require('./request');
const config  = require('./config');
const logger  = require('./log');
const fs      = require('fs');
const jedis   = require('./jedis');
const Const   = require('./const');

class pushManage{

    /**
     * 设计成单例
     * @returns {pushManage|pushManage|null}
     */
    constructor(){
        if(!pushManage.single){
            // this.taskQueue = [];
            this.redis = new jedis();
            pushManage.single = this;
        }
        return pushManage.single;
    }

    /**
     * 添加任务到队列
     */
    async addQueue(task){
        await this.redis.sadd(Const._PUSH_TASK_QUEUE,JSON.stringify(task));
        let queueSize = await this.queueLength();
        logger.info(`Create push task successful. Queue length:${JSON.stringify(queueSize)}`);
        // this.log();
    }

    /**
     * 随机获取一个任务
     * @returns {*}
     */
    async spopTask(){
        return await this.redis.spop(Const._PUSH_TASK_QUEUE);
    }

    /**
     * 获取任务队列长度
     * @returns {*}
     */
    async queueLength(){
        return await this.redis.scard(Const._PUSH_TASK_QUEUE);
    }

    /**
     * 发布到后台
     */
    async release(){
        if(this.queueLength() === 0){
            logger.info(`Task queue is empty. `);
            return;
        }

        let task = await this.spopTask();
        if(!task){
            logger.warn(`Task data is invalid. Task info :{${JSON.stringify(task)}`);
            return;
        }
        logger.info(`Do push task :${JSON.stringify(task)}`);
        task = JSON.parse(task);
        var options = config.push.options;

        options.formData.title = task.title;
        options.formData.tags  = task.tags;
        options.formData.file  = fs.createReadStream(task.filePath);

        logger.debug(`Do request options:${JSON.stringify(options)}`);

        request.upload(options,(body) => {
            logger.info(`Upload video source successful. Body:${JSON.stringify(body)}`);
            logger.debug(`Remaining task：${JSON.stringify(this.queueLength())} `);
        },(error) => {
            logger.err(`Upload video source failed. error message: ${error}`);
        });
    }

    async log(){
        var res = await this.redis.smembers(Const._PUSH_TASK_QUEUE);
        logger.debug(`Queue message:${JSON.stringify(res)}`);
    }
}

pushManage.single = null;

module.exports = pushManage;
