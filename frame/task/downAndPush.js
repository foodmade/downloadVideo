const jedis      = require('../tools/jedis');
const source     = require('../task/source');
const log        = require('../config/log');
const utils      = require('../tools/utils');
const path       = require('path');
const request    = require('request');
const fs         = require('fs');
const cmdHandler = require('../tools/cmdHandler');
const config     = require('../config/config');


const _PIPE_MSG_RUN_MSG  = 10000;
const _PIPE_MSG_STOP_MSG = -10000;

class downAndPush {

    constructor() {
        this.redis = new jedis();
    }

    async do(){
        return new Promise((async (resolve, reject) => {
            let sourceExample = new source();

            let downloadOpt = await sourceExample.getDownloadTask();

            if(Object.keys(downloadOpt).length === 0){
                reject();
                return;
            }
            log.info(`Start download ts. Download info:${JSON.stringify(downloadOpt)}`);

            let tmpDir = path.join(__dirname,`../../source/${downloadOpt.fileName}`,);
            //生成下载任务临时目录
            utils.createDir(tmpDir);

            let tsUrl = downloadOpt.ts;
            if(utils.validUrlFormat(tsUrl)){
                tsUrl = utils.extractTsPath(tsUrl);
            }
            let filePath = path.join(tmpDir,tsUrl);
            //下载文件
            this.down(downloadOpt,filePath)
                .then(async (options,) => {
                    log.info(`Ts download finish. url:${options.filePath} chunkLength:${options.chunkLength}`);
                    //推送到文件服务器
                    this.push(filePath,downloadOpt.fileName)
                        .then(async () => {
                            //更新任务信息
                            await sourceExample.increaseTaskInfo(downloadOpt.token,options.chunkLength);
                            resolve();
                        });
                }).catch(async (options) => {
                    //如果出现异常,将任务重新放回下载队列
                    await this.redis.lpush(source.buildTsPoolKey(downloadOpt.fileName),downloadOpt.tsUrl);
                    log.err(`Ts download filed. Add retry queue. FileName:${downloadOpt.fileName} TsUrl:${downloadOpt.tsUrl}`);
                    reject(options.message);
                })
        }))

    }

    /**
     * 发布到远程服务器 使用scp命令拷贝
     * @param filePath 文件路径
     * @param pushDir 文件推送的目录名称
     * @returns {Promise<>}
     */
    async push(filePath,pushDir){
        return new Promise(((resolve, reject) => {
            let cmd = new cmdHandler();
            cmd.pushFile(filePath,pushDir)
                .then(() => {
                    log.info(`File push successful. File path:[${filePath}] serverDir:[${pushDir}]`);
                    resolve();
                }).catch((e) => {
                    log.err(`File push failed. errMessage:${e.message}`);
                    //todo:重试机制 ...
                    reject(e.message);
                })
        }))
    }

    down(downloadOpt,filePath){
        return new Promise(((resolve, reject) => {
            try{
                let url = downloadOpt.tsUrl;
                let ws = fs.createWriteStream(filePath);
                let chunk = 0;
                ws.on('finish',function () {
                    resolve({
                        filePath:filePath,
                        chunkLength:chunk,
                        downloadOpt:downloadOpt
                    });
                });
                let req = request(url,{timeout:10000});

                req.pipe(ws);

                req.on('response', (response) => {
                    chunk = response.headers[ 'content-length' ];
                    log.info(`Chunk length: ${chunk}`);
                });

                req.on('error',function (e) {
                    reject(e.message);
                });
            }catch(e){
                log.err(`下载ts超时,跳过`);
                reject({
                    message:e.message,
                    options:downloadOpt
                });
            }
        }))
    }


    async start(){
        while (true){
            await this.do()
                .then(async () => {
                    await utils.sleep(200);
                }).catch(async (e) => {
                    log.debug(`Execute failed.${e}`);
                    await utils.sleep(500);
                })
        }
    }
}

process.on('message',function (msg) {
    log.info(`Receive down and push cmd message:${JSON.stringify(msg)}`);
    switch (msg.message) {
        case _PIPE_MSG_RUN_MSG:
            log.info(`Receive run work msg. ${msg.message}`);
            new downAndPush().start();
            break;
        case _PIPE_MSG_STOP_MSG:
            log.info(`Receive stop work msg...`);
            break;

    }
});

module.exports = downAndPush;
