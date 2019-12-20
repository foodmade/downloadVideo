const config   = require('./config');
const log4js   = require('log4js');         
const logger   = log4js.getLogger();    
logger.level   = config.log.level;

module.exports = {
    info: function(msg){
        logger.info(msg);
    },
    
    err: function (msg){
        logger.error(msg);
    },
    
    warn: function (msg){
        logger.warn(msg);
    },
    
    debug: function (msg){
        logger.debug(msg);
    }
};

