const jedis     = require('../tools/jedis');
const config    = require('../config/config');
const request   = require('request');
const Const     = require('../tools/const');
const log       = require('../config/log');
const Promise   = require('es6-promise').Promise;
const utils     = require('../tools/utils');

class source {

    constructor() {
        this.redis = new jedis();
    }

    /**
     * 获取下载资源 (从服务器端获取)
     * @returns {Promise<unknown>}
     */
    getSourceByServer(){
        return new Promise((resolve, reject) => {
            log.info(`从服务器获取下载资源......`);
            request({
                url:config.work.taskReq.url,
                headers: utils.headers
            },(err, response, body) => {
                if (!err && response.statusCode === 200) {
                    let downloadTask = JSON.parse(body).responseBody;
                    if(!downloadTask){
                        reject("wait.....");
                        return;
                    }
                    log.info(`获取到的下载任务:${JSON.stringify(downloadTask)}`);
                    resolve(JSON.parse(downloadTask));
                }else{
                    log.info(`获取下载地址失败 error:${JSON.stringify(err)}`);
                    reject(JSON.stringify(err));
                }
            })
        })
    }

    /**
     * 获取下载资源 (从redis中获取)
     * @returns {Promise<void>}
     */
     async getSourceByRedis(){
        let task = await new jedis().spop(Const._DOWNLOAD_QUEUE);
        if(!task || Object.keys(task).length === 0){
            log.debug(`Not download url. taskInfo: ${JSON.stringify(task)}`);
            return null;
        }
        log.info(`Get download task:${task}`);
        return JSON.parse(task);
    }

    /**
     * 添加ts文件到redis任务池中等待下载
     * @param options   任务信息
     * @returns {Promise<void>}
     */
    async addTsUrlToTaskPool(options){
        let fileName = options.fileName;
        if(!fileName || fileName === ''){
            log.err(`Add tsTask failed. FileName must not be null.`);
            return;
        }
        if(!options || options.arr.length === 0){
            log.err(`Add tsTask failed. Ts array length must not is zero.`);
            return;
        }

        //格式化ts地址 todo: 不在此处格式化url,获取任务时辨别
        // options = await this.formatTsUrl(options);

        //组装任务基本信息
        let taskBasisInfo = {
            length: options.arr.length,       //ts总长度
            time: Date.now(),                 //提交时间
            updateTime: Date.now(),           //更新时间
            finishCnt: 0,                     //已完成任务数
            remainCnt: options.arr.length,    //剩余任务数
            chunkLength: 0,                   //已下载文件大小(KB)
            fileName:fileName,                //文件名称 (token)
            host:options.host,                //host
            id:options.id,                    //电影ID (数据库中的主键)
            videoName:options.videoName,      //电影名称
            coverImg:options.coverImg         //电影封面图地址
        };
        log.info(`--------------------`);
        //缓存任务基本信息
        await this.redis.set(source.buildBasisKey(fileName),JSON.stringify(taskBasisInfo));

        let taskKey = source.buildTsPoolKey(fileName);
        //缓存ts列表,等待下载器获取
        await this.redis.lpush(taskKey,options.arr);
        //缓存文件列表 (令牌列表)
        await this.redis.sadd(source.buildTaskKey(),fileName);
        log.info(`添加任务成功 fileName:${fileName}, ts长度:${taskBasisInfo.length}`);
    }

    /**
     * 兼容不同m3u8文件,存在ts只有后缀 或者 全域名的情况。如果不全,则补全
     * @param options
     * @returns {Promise<void>}
     */
    async formatTsUrl(options){
        let arr = options.arr;
        if(!arr || arr.length === 0) {
            return null;
        }

        if(utils.validUrlFormat(arr[0])){
            return options;
        }
        //不满足标准的url格式,则手动追加host.
        log.debug(`Ts url invalid. url:${arr[0]} host:${options.host}`);
        let newArr = [];

        arr.forEach(tsUrl => {
            newArr.push(options.host + tsUrl);
        });
        options.arr = newArr;
        log.debug(`options info:${JSON.stringify(options)}`);
        return options;
    }

    /**
     * 获取下载任务
     * @returns {Promise<{}>}
     */
    async getDownloadTask(){
        //获取一个令牌
        let token = await this.redis.spop(source.buildTaskKey());
        if(!token || Object.keys(token).length === 0){
            return {};
        }
        await this.redis.sadd(source.buildTaskKey(),token);
        log.info(`Got it token. - ${JSON.stringify(token)}`);
        //获取任务基本信息
        let taskBasisInfo = await this.redis.get(source.buildBasisKey(token));
        if(!taskBasisInfo){
            log.err(`Incorrect token:${token}. Not fount basis info mapper.`);
            return {};
        }
        taskBasisInfo = JSON.parse(taskBasisInfo);

        log.info(`Download task basis info:${JSON.stringify(taskBasisInfo)}`);

        let fileName = taskBasisInfo.fileName;
        let length = taskBasisInfo.length;
        let remainCnt = taskBasisInfo.remainCnt;
        let finishCnt = taskBasisInfo.finishCnt;

        if(length === finishCnt){
            log.info(`This download task is finished. fileName:${fileName}`);
            //如果任务已经下载完毕,清除token
            this.delToken(token);
            return {};
        }

        log.info(`Fetch current download basis info.\n fileName:${fileName} \n total:${length} \n remainCnt:${remainCnt}`);
        //从任务池中获取一个ts任务
        let ts = await this.redis.rpop(source.buildTsPoolKey(fileName));
        if(!ts){
            log.err(`FileName:[${fileName}] ts pool is empty.`);
            //如果任务已经下载完毕,清除token
            this.delToken(token);
            return {};
        }

        let tsUrl;
        if(!utils.validUrlFormat(ts)){
            //格式化url
            tsUrl = taskBasisInfo.host + ts;
        }else{
            tsUrl = ts;
        }

        return {
            fileName:fileName,
            ts:ts,
            tsUrl:tsUrl,
            token:token,
            taskBasisInfo:taskBasisInfo
        };
    }

    /**
     * 更新任务信息
     * @param token
     * @param chunkLength
     * @returns {Promise<void>}
     */
    async increaseTaskInfo(token,chunkLength){
        let taskBasisInfo = await this.getTaskBasisInfo(token);
        if(!taskBasisInfo){
            return;
        }

        taskBasisInfo = JSON.parse(taskBasisInfo);
        //获取剩余ts数量
        taskBasisInfo.remainCnt = await this.redis.llen(source.buildTsPoolKey(taskBasisInfo.fileName));
        taskBasisInfo.updateTime = Date.now();
        //计算下载量
        taskBasisInfo.chunkLength = parseInt(taskBasisInfo.chunkLength) + parseInt(chunkLength);
        await this.redis.set(source.buildBasisKey(token),JSON.stringify(taskBasisInfo));

        let isFinish = await this.afterCheck(token);
        if(!isFinish){
            return;
        }
        //标志已完成,等待服务器更新mysql资源
        await this.redis.sadd(Const._DOWNLOAD_FINISH_QUEUE,token);
    }

    async delToken(token){
        await this.redis.srem(source.buildTaskKey(),token);
    }

    /**
     * 后置检查,主要检查任务是否下载完毕
     * @param token
     * @returns {Promise<boolean>}
     */
    async afterCheck(token){
        let basisOptions = await this.getTaskBasisInfo(token);
        if(source.invalidOpt(basisOptions)){
            log.err(`Invalid task basis options.--> ${basisOptions}`);
            return false
        }
        basisOptions = JSON.parse(basisOptions);
        let isOk = (basisOptions.remainCnt !== 0);
        log.info(`Download task processing -- ${basisOptions.remainCnt}/${basisOptions.length}`);
        if(!isOk){
            return isOk;
        }
        return true;
    }

    /**
     * 建立数据库中的电影主键ID与新的fileName关联,便于下载完毕后,追寻到对应的资源
     * @param id
     * @param fileName
     * @returns {Promise<void>}
     */
    async createMovieMapperInfo(id,fileName){
        await this.redis.set(source.buildIdMapperKey(fileName),id);
    }

    /**
     * 检验任务基本信息的有效性
     */
    static invalidOpt(basisOpt){
        return !basisOpt;
    }

    /**
     * 获取任务基本信息
     * @param token
     * @returns {Promise<*>}
     */
    async getTaskBasisInfo(token){
        return await this.redis.get(source.buildBasisKey(token));
    }

    /**
     * 下载任务基本信息key
     * @param fileName
     * @returns {string}
     */
    static buildBasisKey(fileName){
        return Const._TS_TASK_BASIS_INFO + ':' + fileName;
    }

    /**
     * 下载任务池key
     * @param fileName
     * @returns {string}
     */
    static buildTsPoolKey(fileName){
        return Const._TS_TASK_POOL_INFO + ":" + fileName;
    }

    /**
     * 令牌列表
     * @returns {string}
     */
    static buildTaskKey(){
        return Const._DOWNLOAD_TASK_KEYS;
    }

    /**
     * 资源映射
     * @param fileName
     * @returns {string}
     */
    static buildIdMapperKey(fileName){
        return Const._TS_MOVIE_ID_MAPPER + ":" + fileName;
    }
}
module.exports = source;
