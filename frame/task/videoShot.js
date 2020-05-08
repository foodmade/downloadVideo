/**
 * 视频截图,获取随机一帧当做封面图
 */
class videoShot{
    constructor(path) {
        this.videoPath = path;
    }

    /**
     * 解析m3u8地址,随机获取一个Ts文件中的某一帧图片
     * @returns {Promise<void>}
     */
    async shot(){

    }
}
module.exports = videoShot;
