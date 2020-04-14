const work           = require('./work');
const log            = require('./config/log');
const config         = require('./config/config');
const utils          = require('./tools/utils');
const pushManager    = require('./manage/pushManage');
const tokenManage    = require('./manage/tokenManage');
const workerFactory  = require('child_process');
const path           = require('path');

const workerPath     = path.join(__dirname, './manage/urlValidManage.js');

const _PIPE_MSG_RUN_MSG  = 10000;
const _PIPE_MSG_STOP_MSG = -10000;

module.exports = {
    _WORKERS:[],
    _UUID:-1,
    init: function () {
        let THIS_MODULE = this;
        THIS_MODULE._IS_RUNNING = false;
        global.isRuning = false;
    },

    /**
     * 下载器线程
     */
    downloadWorkStart: function () {
        if(utils.getWorkStatus()){
            log.debug(`Work is running.......`);
            return;
        }
        utils.startWork();
        work.startWork();
    },

    /**
     * 线程启动函数
     */
    startDownloadTsTimer: function(){
        log.info(`Start download thread.`);
        var THIS_MODULE = this;
        setInterval(function(){
            THIS_MODULE.downloadWorkStart();
        },config.work.taskTimeElapse);
    },
    /**
     * 推送线程定时线程
     */
    pushStartTimer: function () {
        log.info(`Start push thread.`);
        var THIS_MODULE = this;
        setInterval(function(){
            THIS_MODULE.pushStart();
        },config.work.pushTaskTimeElapse);
    },

    /**
     * 刷新Token定时线程
     */
    refreshTokenTimer: function () {
        log.info(`Start Refresh token thread..`);
        var THIS_MODULE = this;
        setInterval(function(){
            THIS_MODULE.refreshToken();
            refreshTokenTimer();
        },config.work.refreshTokenElapse);
    },

    /**
     * url校验线程 (采用多进程 fork模式)
     */
    startUrlCheckWork: function(){
        log.info(`Start url valid check thread..`);
        let THIS_MODULE = this;
        for (let i = 0; i < config.work.urlValidChildThreadCount; ++i){
            THIS_MODULE._WORKERS.push(THIS_MODULE.activeWork(i));
        }
        log.info(`Start worker count:[${THIS_MODULE._WORKERS.length}]`);
    },

    /**
     * 停止子工作线程
     */
    stopUrlCheckWork: function(){
        let THIS_MODULE = this;
        THIS_MODULE._WORKERS.forEach(work => {
            THIS_MODULE.killWorker(work.wid);
        })
    },

    /**
     * 激活工作线程
     * @param wid
     * @returns {{process: workerFactory.fork, wid: *, time: number}}
     */
    activeWork: function(wid){
        let THIS_MODULE = this;
        log.info(`Url check handler work [${wid}] ! path:[${workerPath}] `);
        let worker = {
            wid:wid,
            process:new workerFactory.fork(workerPath),
            time:(new Date()).getTime()
        };
        worker.process.on('message',function (msg) {
            log.info(`Callback child process message: ${JSON.stringify(msg)}`);
        });
        THIS_MODULE.sendMessage(worker,wid,_PIPE_MSG_RUN_MSG,{});
        return worker;
    },

    sendMessage: function(worker, wid, msg, msgData){
        try{
            if(worker != null && worker.process != null){
                log.info(`Send worker[${wid}] message:[${msg}]`);
                worker.process.send({
                    wid:wid,
                    message:msg,
                    msgData:msgData
                })
            }else{
                log.err(`Send worker[${wid}] message error. NULL worker. msg:${msg}`);
            }
        }catch (e) {
            log.err(`Send worker[${wid}] message throw exception. errMsg:${e.message}`);
        }
    },

    killWorker: function(wid){
        let THIS_MODULE = this;
        let worker = THIS_MODULE._WORKERS[wid];
        log.info(`Kill worker wid[${wid}] worker:${JSON.stringify(worker)}`);
        worker.process.kill();
        worker.process = null;
    },

    /**
     * 推送任务线程
     */
    pushStart: function(){
        new pushManager().release();
    },

    /**
     * token刷新
     */
    refreshToken: function(){
        new tokenManage().generateToken();
    },
};









