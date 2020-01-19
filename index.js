const control = require('./frame/control');

const download = 'download';
const push = 'push';
const commandArgs = [download,push];

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
        if(download === arg){
            //下载器定时任务
            control.startTimer();
        }
        if(push === arg){
            //推送视频定时任务
            control.pushStartTimer();
        }
    })
}else{
    control.startTimer();
    control.pushStartTimer();
}
control.refreshTokenTimer();


