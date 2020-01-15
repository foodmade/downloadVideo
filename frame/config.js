var _LOG_LEVEL_ERROR = 'error';
var _LOG_LEVEL_WARNING = 'warn';
var _LOG_LEVEL_INFO = 'info';
var _LOG_LEVEL_DEBUG = 'debug';


module.exports = {
    work:{
        //Download thread execut await time.
        taskTimeElapse: 1000,
        //Commit push task execute thread await time elapse.
        pushTaskTimeElapse: 30000,
        //Fetch download video task.
        taskReq:{
            url:"http://task.crawler.com:8089/api/getDownloadTask"
        },
        //Commit push task status.
        pushTask:{
            url:"http://task.crawler.com:8089/api/commitTaskStatus"
        }
    },
    //Push video request options.
    push:{
        options:{
            upload: {
                url:'http://172.31.17.12:9090/porter/file/upload/file',
                // url:'http://127.0.0.1:9090/porter/file/upload/file',
                formData:{
                    file:'',
                    fileType:0,
                },
                headers:{
                    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'token':'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOlsiMTMxNCIsIjExRTYxMzA1MTY0NDhCOUI1REJFRUUyOTBBREUzM0ZBIiwiMTU3ODk5Njk0MTEwMSJdLCJleHAiOjE1ODA0NjgxNzB9.8LAtjiOnGwEEm1YHSZfn2uHYuX8p2hjSvydkQD--uUU'
                }
            },
            save:{
                url:'http://172.31.17.12:9090/porter/video/add',
                formData:{
                    title:'',
                    timeLen:1000,
                    description:'',
                    fileId:'',
                    tags:''
                },
                headers:{
                    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                    'token':'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOlsiMTMxNCIsIjExRTYxMzA1MTY0NDhCOUI1REJFRUUyOTBBREUzM0ZBIiwiMTU3ODk5Njk0MTEwMSJdLCJleHAiOjE1ODA0NjgxNzB9.8LAtjiOnGwEEm1YHSZfn2uHYuX8p2hjSvydkQD--uUU'
                }
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
            auth_pass:''
        }
    }
};