const fs          = require("fs");
const downUtils   = require("./down");
const utils       = require('./tools/utils');
const log         = require('./config/log');
const Promise     = require('es6-promise').Promise;
const request     = require('request');
const path        = require('path');
const source      = require('./task/source');
const jedis       = require('./tools/jedis');
const cmdHandler  = require('./tools/cmdHandler');
const ejsUtil     = require('./tools/ejsUtil');

const _PIPE_MSG_RUN_MSG  = 10000;
const _PIPE_MSG_STOP_MSG = -10000;


//下载index.m4u8索引文件
const downM3u8Index = function (taskData) {
    return new Promise((resolve, reject) => {
        const url = taskData.playUrl;
        log.info(`开始下载m3u8索引文件. url:${url}`);
        request(url,{timeout:10000},(err, response, body) => {
            if (!err && response.statusCode === 200) {
                log.info(`索引文件请求成功,准备写入`);

                let fileName = utils.randomBytes(15);

                let tmpDir = path.join(__dirname,'../source',fileName);
                utils.createDir(tmpDir);

                let tmpIndexPath = path.join(__dirname,'../source',fileName,'index.m3u8');
                fs.writeFileSync(tmpIndexPath,body);
                let host = utils.parserHost(url);
                log.info(`索引文件写入成功`);
                resolve({
                    tmpIndexPath:tmpIndexPath,
                    host:host,
                    taskData:taskData,
                    fileName:fileName
                });
            }else{
                log.info(`下载索引文件错误 error:${err}`);
                reject();
            }
        })
    })
};

//解析m3u8文件,获得ts下载地址
const parserM3u8Index = function (resolveObj) {
    return new Promise(async (resolve, reject) => {
        const indexPath = resolveObj.tmpIndexPath;
        const host = resolveObj.host;
        log.info(`开始解析m3u8索引文件, \n 文件路径:${indexPath} \n host:${host} `);
        let source = fs.readFileSync(indexPath,"utf-8");
        let arr  = source.split("\n");
        arr = arr.filter((item)=>{
            return item.match(/\.ts/);
        });

        /**
         * todo://重要!!!!
         * 由于第三方m3u8索引文件中的ts下载地址存在以下2种方式
         * 1：ts文件全地址 http(s)://www.ossyun.com/tttt001.ts
         * 2：ts文件名称 tttt001.ts
         * 这儿需要统一格式为情况(2)
         * 因为本地下载时会发布至远程服务器,避免m3u8文件中的地址与远程服务器ts文件地址不一致。
         * 解决方式：
         *  1：如果存在全域名ts,解析ts文件名,加入到临时缓存中
         *  2：从新生成index.m3u8索引地址,ts文件地址按照临时缓存中的ts文件名排列
         *  3：发布至远程服务器时,使用新生成的index.m3u8进行发布
         */
        let isValid = await utils.validUrlFormat(arr[0]);
        if(isValid){
            //说明是全域名格式,需要解析原始m3u8文件中的ts文件名称,并且生成新的m3u8文件
            let tmpTsArr = await utils.parserTsNameByM3u8(arr);
            log.debug(`Original ts arr:${JSON.stringify(arr)} New ts arr:${JSON.stringify(tmpTsArr)}`);
            //替换原始index.m3u8,使用新的文件
            resolveObj.tmpIndexPath = await ejsUtil.generateM3u8Index(tmpTsArr,resolveObj.fileName);
        }

        log.debug(`分割数据：${JSON.stringify(arr)}`);
        resolve({
            arr:arr,
            host:host,
            taskData:resolveObj.taskData,
            fileName:resolveObj.fileName,
            indexPath:resolveObj.tmpIndexPath
        })
    })
};



/**
 * 本地下载并合并为mp4
 * @param resolveObj
 */
const down = function(resolveObj){
    log.info(`解析ts下载地址成功 \n 文件个数:${resolveObj.arr.length} \n Host:${resolveObj.host} \n 开始下载ts文件.....`);
    downUtils(resolveObj);
};

/**
 * 分布式下载
 * @param resolveObj
 */
const downAndSyn = async function (resolveObj) {
    log.info(`解析ts下载地址成功 \n 文件个数:${resolveObj.arr.length} \n Host:${resolveObj.host} \n 添加至下载队列`);
    let taskOptions = {
        arr: resolveObj.arr,
        fileName: resolveObj.fileName,
        host:resolveObj.host,
        id:resolveObj.taskData.id,
        coverImg:resolveObj.coverImg,
        videoName:resolveObj.videoName
    };

    //先同步index.m3u8索引文件到资源服务器
    let cmd = new cmdHandler();
    cmd.pushFile(resolveObj.indexPath,resolveObj.fileName)
        .then(async () => {
            await new source().addTsUrlToTaskPool(taskOptions);
        }).catch((e) => {
            log.err(`Add ts task to pool failed. errMsg:${e.message}`);
        });
};

const startWork = async function(){
    //这儿从redis中获取下载任务
    let task = await new source().getSourceByRedis();
    if(!task){
        utils.stopWork();
        return;
    }
    downM3u8Index(task)
                 .then(parserM3u8Index)
                 .then(downAndSyn)
                 .catch((reason) => {
                    log.err(`执行失败: ${reason}`);
                    utils.stopWork();
                 });
};

async function start(){
    while (true){
        await startWork();
        await utils.sleep(200);
    }
}

/**
 * 接收父进程消息,控制子进程状态
 */
process.on('message',async function (msg) {
    log.info(`Receive cmd message:${JSON.stringify(msg)}`);
    switch (msg.message) {
        case _PIPE_MSG_RUN_MSG:
            log.info(`Receive run work msg. ${msg.message}`);
            start();
            break;
        case _PIPE_MSG_STOP_MSG:
            log.info(`Receive stop work msg...`);
            break;

    }
});

module.exports = {
    startWork:startWork
};
