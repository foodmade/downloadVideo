const request  = require('frame/tools/request');
const logger   = require('../config/log');

module.exports = {
    post: function(options,callback,errback){
        request({
            url: options.url,
            method: "POST",
            json: true,
            body: options.formData,
            headers:options.headers
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                logger.info(`Method:[POST]. Status:[Successful]. rspBody:${JSON.stringify(body)}`);
                callback(body);
            }else{
                logger.err(`Method:[POST]. Status:[Failed]. exMsg:${JSON.stringify(response)}`);
                errback(error);
            }
        }); 
    },
    
    get: function(url,callback,errback){
        request({
            url:url,
            method:'GET'
        },(error, response, body) => {
            if(!error && response.statusCode === 200){
                logger.info(`Method:[GET] . Status:[Successful]. rspBody:${body}`);
            }else{
                logger.warn(`Method:[GET]. Status:[Failed]. exMsg:${err}`);
            }
        })
    },

    /**
     * 上传文件
     */
    upload: function (options,callback,errback) {
        request.post({
            url: options.url,
            formData: options.formData,
            headers: options.headers
        },function (error,response,body) {
            if(error){
                errback(error);
            }else{
                callback(body);
            }
        })
    },
};