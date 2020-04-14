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
        pushTaskTimeElapse: 20000,
        //Refresh token execute thread time elapse.
        refreshTokenElapse: 1000 * 60 * 60,
        //Download m3u8 index sources thread await time.
        downloadIndexTimeElapse: 1000 * 20,
        //Url valid handler count.
        urlValidChildThreadCount: 5,
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
        },
        //m3u8 sources request address.
        sourceTask:{
            url:'http://interface.my91apimy.com:8080/api.php',
            from:{
                data:'0EB44C7F3C20A63808D6C2237D6F1A5FC64F2074D08F8339CC26C74A171D29D99EDCE379AB7F94CF50ECF95CAD938DCD65E881DF2C0B7F71FE15185F7CA1016E4FD500A14C90C4D14967BD45E95F505688583D130E1712DEF5BB750DFE479F602F78E02A0C37A12A9D874C7478006D5867B9905ADCF46DA3974232DE8A107A11FB70307C3AE60BAA10E49B812452D61F843A095ECDBC7B0977251D853A70D5DEB6547C9800222ABE215541CFE32CF7A452C2BB444FFE97D62D4E8071',
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
