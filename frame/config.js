var _LOG_LEVEL_ERROR = 'error';
var _LOG_LEVEL_WARNING = 'warn';
var _LOG_LEVEL_INFO = 'info';
var _LOG_LEVEL_DEBUG = 'debug';


module.exports = {
    work:{
        taskTimeElapse: 5000,
        taskReq:{
            url:"http://task.crawler.com:8089/api/getDownloadTask"
        }
    },
    log:{
        level:_LOG_LEVEL_INFO
    }
};