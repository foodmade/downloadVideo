const request       = require("request");
const fs            = require("fs");
const path          = require("path");
const fsextra       = require('fs-extra');
const utils         = require('./tools/utils');
const log           = require('./config/log');
const merge         = require('./task/merge');


module.exports = function(opt){
    opt = opt || {};
    var arr = opt.arr || []; //所有 ts的文件名或者地址
    var host = opt.host || ""; //下载 ts 的 域名，如果 arr 里面的元素已经包含，可以不传
    var outputName = opt.name ||  `${(new Date()).getTime()}.mp4`; //导出视频的名称
    var taskData = opt.taskData; //下载任务体

    log.debug(`Ts列表：${JSON.stringify(arr)}`);

    const tsFile = path.join(__dirname,`../source/${utils.randomBytes(10)}`,);

    log.info(`本次资源临时文件: ${tsFile}`);
    utils.createDir(tsFile);//递归创建文件

    const resultDir = path.join(__dirname,`../result`);
    utils.createDir(resultDir);//递归创建文件
    const resultFile = path.join(resultDir,outputName);
    var localPath = [] ; //下载到本地的路径
    //开始下载ts文件
    load();
    function load(){
        log.debug(`Control status:${utils.getWorkStatus()}`);
        if(arr.length > 0){
            var u =  arr.shift();
            var url = host + u;
            // var url = u;
            log.info(`progress---: ${url}`);
            down(url);
            //下载 ts 文件
            function down(url){
                var p = url.split("?")[0];
                var nm = path.parse(p);
                var nme = nm["name"] + nm["ext"];
                rpath = path.join(tsFile,nme);

                localPath.push(`file ${nme}`); //缓存本地路径，用来合成

                try{
                    request(url,{timeout:10000}, (err, response, body) => {
                        if (err ) {
                            localPath.pop();
                        }
                        load();
                    }).pipe(fs.createWriteStream(rpath));
                }catch(e){
                    log.err(`下载ts超时,跳过`);
                }
            }
        }else{
            //下载完成
            log.info("下载完成--开始生成配置");
            localPath.unshift("ffconcat version 1.0");
            fs.writeFileSync(path.join(tsFile,"./input.txt"), localPath.join("\n") , undefined, 'utf-8');

            new merge(tsFile,resultFile)
                .do()
                .then(() => {
                    utils.stopWork();
                }).catch((error) => {
                    utils.stopWork();
                });
        }
    }
};
