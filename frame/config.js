const _LOG_LEVEL_ERROR   = 'error';
const _LOG_LEVEL_WARNING = 'warn';
const _LOG_LEVEL_INFO    = 'info';
const _LOG_LEVEL_DEBUG   = 'debug';

const accept = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';

const apiHost = 'http://172.31.17.12:9090';

module.exports = {
    work:{
        //Download thread execut await time.
        taskTimeElapse: 1000,
        //Commit push task execute thread await time elapse.
        pushTaskTimeElapse: 5000,
        //Refresh token execute thread time elapse.
        refreshTokenElapse: 1000 * 60 * 60,
        //Fetch download video task.
        taskReq:{
            url:"http://task.crawler.com:8089/api/getDownloadTask"
        },
        //Commit push task status.
        pushTask:{
            url:"http://task.crawler.com:8089/api/commitTaskStatus"
        },
        //Login api.
        loginTask:{
            url: apiHost + '/porter/security/open/login',
            headers:{
                'Accept':accept
            },
            formData:{
                loginUserName:'',
                password:''
            }
        }
    },
    //Push video request options.
    push:{
        options:{
            upload: {
                url: apiHost + '/porter/file/upload/file',
                formData:{
                    file:'',
                    fileType:0,
                },
                headers:{
                    Accept:accept,
                    token:''
                }
            },
            save:{
                url: apiHost + '/porter/video/add',
                formData:{
                    title:'',
                    timeLen:1000,
                    description:'',
                    fileId:'',
                    tags:''
                },
                headers:{
                    Accept:accept,
                    token:''
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