const request  = require('./request');
const config   = require('./config');
const logger   = require('./log');
const fs       = require('fs');
const jedis    = require('./jedis');
const Const    = require('./const');
const pushTask = require('./pushTask');

class pushManage{

    /**
     * 设计成单例
     * @returns {pushManage|pushManage|null}
     */
    constructor(){
        if(!pushManage.single){
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
        logger.info(`【Do push video work::】 Create push task successful. Queue length:${JSON.stringify(queueSize)}`);
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
     * 发布到后台 (ps:任务来源于redis key:PUSH_TASK_QUEUE 队列)
     * todo: 此操作分为2步骤
     * 1：调用服务器端上传视频接口,得到视频ID
     * 2：调用保存函数进行数据库持久化
     */
    async release(){
        if(this.queueLength() === 0){
            logger.info(`【Do push video work::】 Task queue is empty. `);
            return;
        }

        let task = await this.spopTask();
        if(!task){
            logger.warn(`【Do push video work::】 Task data is invalid. Task info :{${JSON.stringify(task)}`);
            return;
        }
        logger.info(`【Do push video work::】 Do push task :${JSON.stringify(task)}`);
        task = JSON.parse(task);
        let options = config.push.options.upload;

        options.formData.file  = fs.createReadStream(task.filePath);

        logger.info(`【Do push video work::】 Do request options:${JSON.stringify(options)}`);

        //调用上传视频接口,如果成功,则回调save函数进行数据库持久化操作,否则跳过
        request.upload(options,async (videoData) => {
            logger.info(`【Do push video work::】 Upload video source successful. RespMessage:${videoData}`);
            this.save(videoData,task,(body) => {
                logger.info(`【Do push video work::】 *********Save video info successful********. RespMessage:${JSON.stringify(body)}`);
                //通知服务器推送成功消息
                pushTask.callbackPushTask(task,body.formData.fileId,(body) => {
                    logger.info(`【Do push video work::】 Commit push task status successful. RespMessage:${body}`);
                },(error) => {
                    logger.err(`【Do push video work::】 Commit push task status failed. throw message:${error}`);
                });
            },(error) => {
                logger.err(`【Do push video work::】 Save video info failed. message:${error}`);
            });
        },(error) => {
            logger.err(`【Do push video work::】 Upload video source failed. error message: ${error}`);
        });
    }

    /**
     * 发布成功后,调用保存进行持久化
     * @param videoData   上传视频返回的视频id等信息
     * @param videoDetail 视频的参数信息
     * @param callback    成功回调
     * @param errback     失败回调
     * @returns {Promise<void>}
     */
     save(videoData,videoDetail,callback,errback){

         let options = config.push.options.save;

         videoData = JSON.parse(videoData);

         options.formData.title = videoDetail.title;
         options.formData.description = videoDetail.title;
         options.formData.fileId = videoData.data.id;

         options.formData.tags = videoDetail.tags.toString();

         logger.info(`Save video request options:${JSON.stringify(options)}`);

         request.post(options,(body) => {
             callback(options);
         },(error) => {
             errback(error);
         });
    }

    async log(){
        var res = await this.redis.smembers(Const._PUSH_TASK_QUEUE);
        logger.debug(`Queue detail:[${JSON.stringify(res)}]`);
    }
}

pushManage.single = null;

module.exports = pushManage;
