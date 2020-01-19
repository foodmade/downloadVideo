const jedis   = require('./jedis');
const Const   = require('./const');
const log     = require('./log');
const request = require('./request');
const config  = require('./config');
/**
 * JWT token管理队列
 * 每隔x重新登录账号管理队列中的账号获取token存入缓存,等待api调用时获取
 */
class tokenManage{
    constructor() {
        if(!tokenManage.single){
            this.redis = new jedis();
            tokenManage.single = this;
        }
        return tokenManage.single;
    }

    /**
     * 获取redis定义的机器人账号列表
     */
    async getAccounts(){
        let accounts = await this.redis.smembers(Const._ACCOUNT_QUEUE);
        if(!accounts || accounts.length === 0){
            log.warn(`Not found robot account list. Please setting robot account.`);
            return [];
        }
        return accounts;
    }

    /**
     * 针对过期的token进行重新模拟登陆获取token
     * @returns {Promise<void>}
     */
    async generateToken(){

        let accounts = await this.getAccounts();
        if(accounts.length === 0){
            log.warn(`Not account list.`);
            return;
        }

        log.info(`Robot accounts list size:${accounts.length}`);

        /**
         * 清空之前的token信息
         */
        await this.redis.del(Const._TOKEN_QUEUE);

        /**
         * 循环账号列表,模拟登陆获取token,缓存至redis
         */
        accounts.forEach((account, index, arrays) => {

            if(!account){
                return;
            }

            account = JSON.parse(account);
            log.info(`Ready to login. Account info:${JSON.stringify(account)}`);

            let options = config.work.loginTask;
            options.formData.loginUserName = account.userName;
            options.formData.password = account.password;

            request.post(options,(body) => {
                if(!body.success){
                    log.warn(`Login failed. Body:${JSON.stringify(body)}`);
                    return;
                }
                let userInfo = body.data.userInfo;
                let token = userInfo.token;
                log.info(`Login successful. loginUserName:${options.formData.loginUserName} token:${token}`);
                if(!token){
                    log.warn(`Login api response token is empty.`);
                    return;
                }
                account.token = token;
                account.nickName = userInfo.nickname;

                this.redis.sadd(Const._TOKEN_QUEUE,JSON.stringify(account));
            },(error) => {
                log.err(`Login failed. accountInfo:${JSON.stringify(account)} \n error:${error}`)
            })
        })
    }

    /**
     * 随机获取一个Token
     * @returns {Promise<string>}
     */
    async getToken(){
        let tokenObj = await this.redis.srandmember(Const._TOKEN_QUEUE);
        if(!tokenObj){
            return undefined;
        }
        return JSON.parse(tokenObj).token;
    }
}

tokenManage.single = null;
module.exports = tokenManage;