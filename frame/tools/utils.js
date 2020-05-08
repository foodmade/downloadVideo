const crypto   = require('crypto');
const log      = require('../config/log');
const fs       = require('fs');
const path     = require('path');

/**
 * 获取随机数
 * @param c 多少位
 * @returns {string} 随机数字符串
 */
function randomBytes(c){
    var buf = crypto.randomBytes(c);
    return buf.toString('hex');
}

/**
 * 解析域名中的host
 * @param url
 * @returns {string}
 */
function parserHost(url){
    var lastIndex = url.lastIndexOf('/');
    return url.substring(0,lastIndex+1);
}

/**
 * 停止工作线程
 */
function stopWork(){
    global.isRuning = false;
}

/**
 * 设置线程状态为开启
 */
function startWork(){
    global.isRuning = true;
}
/**
 * 获取线程执行状态
 */
function getWorkStatus(){
    return global.isRuning;
}

/**
 * 获取当前系统时间
 * @returns {string}
 */
function getCurrentTime(){
    return new Date().toLocaleTimeString();
}

/**
 * 检查网络地址是否合法
 */
function validUrlFormat(url){
    let RegUrl = new RegExp();
    RegUrl.compile('((http|ftp|https)://)(([a-zA-Z0-9\\._-]+\\.[a-zA-Z]{2,6})|([0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}))(:[0-9]{1,4})*(/[a-zA-Z0-9\\&%_\\./-~-]*)?');
    return RegUrl.test(url);
}

/**
 * 提取url中ts文件名称
 */
function extractTsPath(url) {
    if(!url){
        return '';
    }
    let reg = /\/.*?\.ts/gi;
    let sourceArr = url.match(reg);
    if(!sourceArr || sourceArr.length === 0){
        return '';
    }
    let source = sourceArr[0];
    sourceArr = source.split('/');
    if(sourceArr.length === 0){
        return '';
    }
    return sourceArr[sourceArr.length - 1];
}

/**
 * 线程睡眠
 * @param second 睡眠时间 (秒)
 * @returns {Promise<>}
 */
function sleep(second){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, second);
    })
}

/**
 * 递归的创建文件夹
 * @param dirpath
 */
function mkdirs(dirpath) {
    if (!fs.existsSync(path.dirname(dirpath))) {
        log.info(`Create dir:${dirpath}`);
        mkdirs(path.dirname(dirpath));
    }
    fs.mkdirSync(dirpath);
}

/**
 * 创建文件夹
 * @param myPath
 */
function createDir(myPath){
    fs.existsSync(myPath) === false && mkdirs(myPath);
}

/**
 * 解析全地址的ts文件名称
 */
function parserTsNameByM3u8(tsArr){
    if(!tsArr || tsArr.length === 0){
        return undefined;
    }
    let resArr = [];
    for (let ts of tsArr){
        let tsName = extractTsPath(ts);
        if(!tsName || '' === tsName){
            continue;
        }
        resArr.push(tsName);
    }
    return resArr;
}

module.exports = {
    randomBytes:randomBytes,
    parserHost:parserHost,
    startWork:startWork,
    stopWork:stopWork,
    getWorkStatus:getWorkStatus,
    getCurrentTime:getCurrentTime,
    validUrlFormat:validUrlFormat,
    mkdirs:mkdirs,
    createDir:createDir,
    sleep:sleep,
    extractTsPath:extractTsPath,
    parserTsNameByM3u8:parserTsNameByM3u8,
    headers:{
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
    }
};

