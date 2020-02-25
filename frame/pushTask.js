const request = require('./tools/request');
const utils   = require('./tools/utils');
const config  = require('./config/config');
const log     = require('./config/log');

class pushTask{

    /**
     * 回调推送成功的视频任务到服务端
     */
    static callbackPushTask(taskOptions,fileId,callback,errback){
        let commitData = {
            finishTime:utils.getCurrentTime(),
            task:{
                title:taskOptions.title,
                tags:taskOptions.tags.toString(),
                fileId:fileId
            }
        };

        let options = {
            url: config.work.pushTask.url,
            formData: commitData,
            headers:{}
        };

        log.info(`Callback push task status from data:${JSON.stringify(options)}`);

        request.post(options,(data) => {
            log.info(`Commit push task successful. Video name:${taskOptions.title} responseData:${JSON.stringify(data)}`);
            callback(data);
        },(error) => {
            errback(error);
        })
    }
}
module.exports = pushTask;