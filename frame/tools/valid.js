const utils       = require('./utils');
const log         = require('../config/log');
const util        = require('util');
const urlExists   = util.promisify(require('url-exists'));

class valid{

    constructor(url) {
        this.url = url;
    }

    /**
     * 检查url是否合法,根据Get访问,判断资源是否可到达
     * @returns {Promise<boolean>}
     */
    async urlFormat(){
        if(!this.url){
            return false;
        }

        if(!utils.validUrlFormat(this.url)){
            log.err(`异常的url地址:${this.url}`);
            return false;
        }

        let isExists = await urlExists(this.url);
        log.info(`Url:${this.url} isExist:${isExists}`);
        return isExists;
    }

}
module.exports = valid;
