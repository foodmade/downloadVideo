var crypto = require('crypto');

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

function stopWork(){
    global.isRuning = false;
}

function startWork(){
    global.isRuning = true;
}

function getWorkStatus(){
    return global.isRuning;
}

module.exports = {
    randomBytes:randomBytes,
    parserHost:parserHost,
    startWork:startWork,
    stopWork:stopWork,
    getWorkStatus:getWorkStatus,
    headers:{
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
    }
};

