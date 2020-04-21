const jedis   = require('../tools/jedis');
const Const   = require('../tools/const');
const log     = require('../config/log');
const valid   = require('../tools/valid');
const utils   = require('../tools/utils');

const _PIPE_MSG_RUN_MSG  = 10000;
const _PIPE_MSG_STOP_MSG = -10000;


class urlValidManage{

    constructor() {
        this.redis = new jedis();
    }

    /**
     * 检查存在于redis缓存中的Url地址,筛选出失效的url
     * @returns {Promise<void>}
     */
    async batchValid(){

        let data = await this.redis.spop(Const._URL_VALID_QUEUE);
        if(!data){
            log.debug(`Not found need valid format url data.`);
            return;
        }
        data = JSON.parse(data);
        log.info(`Check current url: ${data.videoUrl} sourceId:${data.id}`);
        let isExist = await new valid(data.videoUrl).urlFormat();
        log.info(`Url:${data.videoUrl} status:${isExist}`);
        if(isExist){
            //如果有效,加入待下载队列
            let downloadOptions = {
                playUrl:data.videoUrl,
                title:data.videoName,
                tags:data.tags
            };
            log.info(`add await download queue. info:${JSON.stringify(downloadOptions)}`);
            await this.redis.sadd(Const._DOWNLOAD_QUEUE,JSON.stringify(downloadOptions));
            return;
        }
        //如果已经失效,放入失效队列,等待服务器删除对应资源
        await this.redis.sadd(Const._EXPIRED_URL_QUEUE,JSON.stringify(data));
    }

    async startScan(){
        while (true){
            await this.batchValid();
            await utils.sleep(500);
        }
    }
}

process.on('message',function (msg) {
    log.info(`Receive cmd message:${JSON.stringify(msg)}`);
    switch (msg.message) {
        case _PIPE_MSG_RUN_MSG:
            log.info(`Receive run work msg. ${msg.message}`);
            new urlValidManage().startScan();
            break;
        case _PIPE_MSG_STOP_MSG:
            log.info(`Receive stop work msg...`);
            break;

    }
});
module.exports = urlValidManage;
