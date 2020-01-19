const jedis = require('./jedis');
const Const = require('./const');
const tokenManage = require('./tokenManage');
const FFMPEGOperation = require('./FFMPEGOperation');


async function test() {

    const ffmpegOperation = new FFMPEGOperation();
    let videoLen = await ffmpegOperation.getVideoTotalDuration("D:\\git_project\\downloadVideo\\result\\638456893722992640.mp4");

    console.log('视频时长：'+videoLen);
}

test();