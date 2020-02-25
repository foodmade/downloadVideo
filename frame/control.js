const work        = require('./work');
const log         = require('./config/log');
const config      = require('./config/config');
const utils       = require('./tools/utils');
const pushManager = require('./manage/pushManage');
const tokenManage = require('./manage/tokenManage');
const downloadIndex = require('./manage/downloadIndexManage');

module.exports = {
    init: function () {
        var THIS_MODULE = this;
        THIS_MODULE._IS_RUNNING = false;
        global.isRuning = false;
        new tokenManage().generateToken();
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
        },config.work.refreshTokenElapse);
    },
};









