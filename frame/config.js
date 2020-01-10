var _LOG_LEVEL_ERROR = 'error';
var _LOG_LEVEL_WARNING = 'warn';
var _LOG_LEVEL_INFO = 'info';
var _LOG_LEVEL_DEBUG = 'debug';


module.exports = {
    work:{
        taskTimeElapse: 1000,
        taskReq:{
            url:"http://task.crawler.com:8089/api/getDownloadTask"
        }
    },
    push:{
        options:{
            url:'http://127.0.0.1:15090/admin/upload/video',
            formData:{
                file:'',//文件流
                createId:2801,//创建人ID
                tags:'',//视频标签
                title:''//视频名称
            },
            headers:{
                'X-token':'22222'
            }
        }
    },
    log:{
        level:_LOG_LEVEL_INFO
    },
    redis:{
        host:'127.0.0.1',
        port:6379,
        options:{
            db:0,
            auth_pass:'chen19960119'
        }
    }
};