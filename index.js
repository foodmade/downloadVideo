const control = require('./frame/control');

const ts       = 'ts';
const push     = 'push';
const valid    = 'valid';
const download = 'download';
const parser   = 'parser';
const commandArgs = [ts,push,valid,download,parser];

process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
  });

control.init();

let args = process.argv.splice(2);
//参数去重
args = [...new Set(args)];

if(args && args.length > 0){
    //检查是否存在未定义参数
    args.forEach(function (arg,index,array) {
        if(commandArgs.indexOf(arg) === -1){
            throw new Error('Unknown command args:[' + arg + ']');
        }
    });
    //根据参数启动对应线程
    args.forEach(function (arg,index,array) {
        if(ts === arg){
            //下载器定时任务
            control.startDownloadTsTimer();
        }
        if(push === arg){
            //推送视频定时任务
            control.pushStartTimer();
        }
        if(valid === arg){
            //url检测器
            control.startUrlCheckWork();
        }
        if(parser === arg){
            //资源解析
            control.startParserTsWork();
        }
        if(download === arg){
            //视频下载
            control.startDownloadMoviesWork();
        }
    })
}else{
    //如果未输入任何参数,则默认启动所有线程
    control.startDownloadTsTimer();
    control.pushStartTimer();
    control.startUrlCheckWork();
    control.startParserTsWork();
    control.startDownloadMoviesWork();
}
control.refreshTokenTimer();


