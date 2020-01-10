const work        = require('./work');
const log         = require('./log');
const config      = require('./config');
const utils       = require('./utils');
const pushManager = require('./pushManage');

module.exports = {
    init: function () {
        var THIS_MODULE = this;
        THIS_MODULE._IS_RUNNING = false;
        global.isRuning = false;
    },

    /**
     * 下载器线程
     */
    workStart: function () {
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
     * 线程启动函数
     */
    start: function(){
        var THIS_MODULE = this;
        setInterval(function(){
            THIS_MODULE.pushStart();
            THIS_MODULE.workStart();
        },config.work.taskTimeElapse);
    }
};









