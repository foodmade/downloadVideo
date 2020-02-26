const fs          = require("fs");
const downUtils   = require("./down");
const utils       = require('./tools/utils');
const log         = require('./config/log');
const config      = require('./config/config');

const Promise     = require('es6-promise').Promise;
const request     = require('request');
const path        = require('path');


//从服务器端获取下载地址
const getSource = function () {
    return new Promise((resolve, reject) => {
        log.info(`从服务器获取下载资源......`);
        request({
            url:config.work.taskReq.url,
            headers: utils.headers
        },(err, response, body) => {
            if (!err && response.statusCode === 200) {
                var downloadTask = JSON.parse(body).responseBody;
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
};

// const getSource = function () {
//     return new Promise((resolve, reject) => {
//         resolve("https://m3u8.cnkamax.com/useruploadfiles/921aa97618d3cdd79af056438fe40632/921aa97618d3cdd79af056438fe40632.m3u8?md5=LdO6Jo9hcctAxodzQ7zBgw&expires=1578566578&start=0&duration=30&via=kekaoyun");
//     })
// };

//下载index.m4u8索引文件
const downM3u8Index = function (taskData) {
    return new Promise((resolve, reject) => {
        const url = taskData.playUrl;
        log.info(`开始下载m3u8索引文件. url:${url}`);
        request(url,(err, response, body) => {
            if (!err && response.statusCode === 200) {
                log.info(`索引文件请求成功,准备写入`);
                var tmpIndexPath = path.join(__dirname,'../index',utils.randomBytes(10) + '.m3u8');
                fs.writeFileSync(tmpIndexPath,body);
                var host = utils.parserHost(url);
                log.info(`索引文件写入成功`);
                resolve({
                    tmpIndexPath:tmpIndexPath,
                    host:host,
                    taskData:taskData
                });
            }else{
                log.info("下载索引文件错误",err);
                reject();
            }
        })
    })
};

//解析m3u8文件,获得ts下载地址
const parserM3u8Index = function (resolveObj) {
    return new Promise((resolve, reject) => {
        const indexPath = resolveObj.tmpIndexPath;
        const host = resolveObj.host;
        log.info(`开始解析m3u8索引文件, \n 文件路径:${indexPath} \n host:${host} `);
        var source = fs.readFileSync(indexPath,"utf-8");
        var arr  = source.split("\n");
        arr = arr.filter((item)=>{
            return item.match(/\.ts/);
        });
        log.info(`分割数据：${JSON.stringify(arr)}`);
        resolve({
            arr:arr,
            host:host,
            taskData:resolveObj.taskData
        })
    })
};

const down = function(resolveObj){
    log.info(`解析ts下载地址成功 \n 文件个数:${resolveObj.arr.length} \n Host:${resolveObj.host} \n 开始下载ts文件.....`);
    if(resolveObj.arr.length > 100){
        log.info(`跳过大文件`);
        return;
    }
    downUtils(resolveObj);
};

const startWork = function(){
    getSource()
        .then(downM3u8Index)
        .then(parserM3u8Index)
        .then(down)
        .catch(function (reason) {
            log.err(`执行失败: ${reason}`);
            utils.stopWork();
        });
};

module.exports = {
    startWork:startWork
};