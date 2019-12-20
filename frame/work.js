const fs  = require("fs");
const downUtils = require("./down");
const utils = require('./utils');
const log = require('./log');
const config = require('./config');

const Promise    = require('es6-promise').Promise;
const request    = require('request');
const path       = require('path');


//从服务器端获取下载地址
const getSource = function () {
    return new Promise((resolve, reject) => {
        log.info(`从服务器获取下载资源......`);
        request({
            url:config.work.taskReq.url,
            headers: utils.headers
        },(err, response, body) => {
            if (!err && response.statusCode === 200) {
                var downLoadUrl = JSON.parse(body).responseBody;
                log.info(`获取到的下载地址:${downLoadUrl}`);
                resolve(downLoadUrl)
            }else{
                log.info(`获取下载地址失败 error:${JSON.stringify(err)}`);
                reject(JSON.stringify(err))
            }
        })
    })
};

//下载index.m4u8索引文件
const downM3u8Index = function (url) {
    return new Promise((resolve, reject) => {
        log.info(`开始下载m3u8索引文件. url:${url}`);
        request({
            url:url,
            headers:utils.headers
        },(err, response, body) => {
            if (!err && response.statusCode === 200) {
                log.info(`索引文件请求成功,准备写入`);
                var tmpIndexPath = path.join(__dirname,'../index',utils.randomBytes(10) + '.m3u8');
                fs.writeFileSync(tmpIndexPath,body);
                var host = utils.parserHost(url);
                log.info(`索引文件写入成功`);
                resolve({
                    tmpIndexPath:tmpIndexPath,
                    host:host
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
            return item.match(/\.ts$/);
        });
        resolve({
            arr:arr,
            host:host
        })
    })
};

const down = function(resolveObj){
    log.info(`解析ts下载地址成功 \n 文件个数:${resolveObj.arr.length} \n Host:${resolveObj.host} \n 开始下载ts文件.....`);
    if(resolveObj.arr.length > 100){
        log.info(`跳过大文件`);
        utils.stopWork();
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