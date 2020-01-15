const control = require('./frame/control');

process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);
  });


control.init();
//下载器定时任务
control.startTimer();
//推送视频定时任务
control.pushStartTimer();

