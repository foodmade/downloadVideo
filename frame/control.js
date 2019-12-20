const work       = require('./work');
const log        = require('./log');
const config     = require('./config');
const utils      = require('./utils');

module.exports = {
    init: function () {
        var THIS_MODULE = this;
        THIS_MODULE._IS_RUNNING = false;
        global.isRuning = false;
    },

    workStart: function () {
        if(utils.getWorkStatus()){
            log.debug(`Work is running.......`);
            return;
        }
        utils.startWork();
        work.startWork();
    },

    start: function(){
        var THIS_MODULE = this;
        setInterval(function(){
            THIS_MODULE.workStart();
        },config.work.taskTimeElapse);
    },
};









