const { exec }   = require('child_process');
const log        = require('../config/log');
const config     = require('../config/config');
const path       = require('path');

const scriptPath = path.join(__dirname,'../script/check_and_create.sh');
const existCode  = 1;
const notExistCode = 0;
const sign       = '$1';

class cmdHandler{

    constructor() {
        if(!cmdHandler.single){
            log.info(`constructor cmdHandler`);
            this._PROCESS_CMD = {
                //检查远程服务器是否存在文件夹或者文件,不存在则创建
                checkAndCreateDirCmd:`sh ${scriptPath} ${config.push.options.scp.host} ${config.push.options.scp.path}${sign}`,
                //scp拷贝文件至远程服务器
                scpCmd:`scp -P ${config.push.options.scp.port} ${sign} root@${config.push.options.scp.host}:${config.push.options.scp.path}$2`,
                //远程创建目录
                createCmd:`ssh -p ${config.push.options.scp.port} root@${config.push.options.scp.host} \`mkdir ${config.push.options.scp.path}${sign}\``
            };
            cmdHandler.single = this;
        }
        return cmdHandler.single;
    }

    /**
     * 检查远程目录是否存在 不存在则创建
     * @param fileDir 远程文件路径
     * @param needCreate 不存在时,是否需要创建
     * @returns {Promise<unknown>}
     */
    checkAndCreateDir(fileDir,needCreate){
        return new Promise(((resolve, reject) => {
            let script = this._PROCESS_CMD.checkAndCreateDirCmd;
            script = script.replace(sign,fileDir);

            this.execCmd(script)
                .then((eRes) => {
                    log.info(`Cmd result info:${JSON.stringify(eRes)}`);
                    if(!eRes.status){
                        reject(eRes.message);
                        return;
                    }
                    if(existCode === parseInt(eRes.stdout)){
                        log.info(`Directory:[${fileDir}] already exist.`);
                        resolve();
                        return;
                    }
                    log.info(`Directory:[${fileDir}] not exist.`);
                    if(!needCreate){
                        resolve();
                        return;
                    }
                    //如果需要创建
                    let createScript = this._PROCESS_CMD.createCmd;
                    createScript = createScript.replace(sign,fileDir);

                    this.execCmd(createScript)
                        .then((eRes) => {
                            if(!eRes.status){
                                reject(eRes.message);
                                return;
                            }
                            resolve(true);
                        }).catch((e) => {
                            throw e;
                        })
                }).catch((e) => {
                    log.err(`Check front cmd execute failed. message:${e.message}`);
                    reject(e.message);
                });
        }))

    }

    /**
     * 执行脚本
     * @param script
     */
    execCmd(script){
        return new Promise(((resolve, reject) => {
            exec(script, (err, stdout, stderr) => {
                if(err){
                    log.err(`Execute remotely script:[${script}] filed. errMessage:${err.message}`);
                    reject({
                        message:err.message,
                        status:false,
                        stdout:stdout.replace('\n','')
                    });
                    return;
                }
                log.info(`Execute remotely script:[${script}] successful. stdout:${stdout}`);
                resolve({
                    message:'',
                    status:true,
                    stdout:stdout.replace('\n','')
                });
            })
        }))
    }

    /**
     * 推送文件
     * @param filePath 本地文件路劲
     * @param pushDir 要推送到的远程服务器目录
     */
    pushFile(filePath,pushDir){
        return new Promise(((resolve, reject) => {
            //检查文件夹是否存在
            this.checkAndCreateDir(pushDir,true)
                .then(() => {
                    let scpScript = this._PROCESS_CMD.scpCmd;
                    scpScript = scpScript.replace('$1',filePath);
                    scpScript = scpScript.replace('$2',pushDir);
                    this.execCmd(scpScript)
                        .then((opt) => {
                            log.info(`Scp command successful. FilePath:${filePath}`);
                            resolve();
                        }).catch((e) => {
                            log.err(`Scp command failed. e:${e.message}`);
                            reject();
                        })
                }).catch((e) => {
                    throw e;
                })
        }))
    }


}
cmdHandler.single = null;
module.exports = cmdHandler;
