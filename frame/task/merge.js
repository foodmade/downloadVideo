const log           = require('../config/log');
const child_process = require('child_process');
const utils         = require('../tools/utils');
const Promise       = require('es6-promise').Promise;
class merge{

    constructor(fileDir,fileName) {
        this.fileDir = fileDir;
        this.fileName = fileName;
    }

    do(){
        return new Promise(((resolve, reject) => {
            //开始依赖配置合成
            log.info(`----开始合成----- tsFile:${this.fileDir}`);
            child_process.exec(`cd ${this.fileDir} &&  ffmpeg -i input.txt -acodec copy -vcodec copy -absf aac_adtstoasc ${this.fileName}`,function(error, stdout, stderr){
                if(error){
                    log.err(`---合成失败--- ${error}`);
                    reject(error);
                }else{
                    log.info(`--合成成功-- ${stdout}`);
                    //删除临时文件
                    fsextra.remove(tsFile, err => {
                        if (err) {
                            log.info(`删除临时文件失败 ${err}`);
                            reject();
                        }else{
                            log.info('删除临时文件成功!');
                            //添加待发布队列
                            new pushManage().addQueue({
                                filePath:resultFile,
                                title:title,
                                tags:tags
                            });
                            resolve();
                        }
                    });
                }
            });
        }));
    }
}
module.exports = merge;
