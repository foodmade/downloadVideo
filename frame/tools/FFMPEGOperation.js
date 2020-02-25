const log      = require('../config/log');
const ffmpeg   = require('ffmpeg');


class FFMPEGOperation {

    constructor() {
    }

    /**
     * 获取视频时长
     * @param videoPath  视频文件地址
     * @returns {*}
     */
    async getVideoTotalDuration(videoPath){
        const process = new ffmpeg(videoPath);
        return process.then(function (video) {
            log.debug('getVideoTotalDuration,seconds:' + video.metadata.duration.seconds);
            return video.metadata.duration.seconds || 0
        }, function (err) {
            log.err('getVideoTotalDuration,err:' + err.message);
            return -1
        })
    }

    //获取视频缩略图
    async getVideoSceenshots(videoPath, outPutPath, frameRate, frameCount){
        const process = new ffmpeg(videoPath);
        return process.then(function (video) {
            video.fnExtractFrameToJPG(outPutPath, {
                frame_rate : frameRate,
                number : frameCount,
                file_name : 'my_frame_%t_%s'
            }, function (error, files) {
                if (!error)
                    log.info('Frames: ' + files)
            })
        }, function (err) {
            log.err('Error: ' + err)
        })
    }

    //拆分视频
    async splitVideo(videoPath, startTime, duration, outVideoPath){
        const    process = new ffmpeg(videoPath);
        return process.then(function (video) {
            video
                .setVideoStartTime(startTime)
                .setVideoDuration(duration)
                .save(outVideoPath, function (error, file) {
                    if (!error){
                        log.info('Video file: ' + file)
                    }
                })
        }, function (err) {
            log.err('Error: ' + err)
        })
    }
}

module.exports = FFMPEGOperation;