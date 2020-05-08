const fs          = require('fs');
const path        = require('path');
const Promise     = require('es6-promise').Promise;

class fileUtils{

    constructor() {
    }

    /**
     * 写入数据到文件(同步写入)
     * @param data      数据
     * @param filePath 文件路径
     */
    static writeFileAsync (filePath,data) {
        fs.writeFileSync(filePath,data);
    }

    /**
     * 读取路径信息
     * @param {string} path 路径
     */
    static getStat(path){
        return new Promise((resolve, reject) => {
            fs.stat(path, (err, stats) => {
                if(err){
                    resolve(false);
                }else{
                    resolve(stats);
                }
            })
        })
    }

    /**
     * 创建路径
     * @param {string} dir 路径
     */
    static mkdir(dir){
        return new Promise((resolve, reject) => {
            fs.mkdir(dir, err => {
                if(err){
                    resolve(false);
                }else{
                    resolve(true);
                }
            })
        })
    }

    /**
     * 路径是否存在，不存在则创建
     * @param {string} dir 路径
     */
     static async dirExists(dir){
        let isExists = await fileUtils.getStat(dir);
        //如果该路径且不是文件，返回true
        if(isExists && isExists.isDirectory()){
            return true;
        }else if(isExists){     //如果该路径存在但是文件，返回false
            return false;
        }
        //如果该路径不存在
        let tempDir = path.parse(dir).dir;      //拿到上级路径
        //递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
        let status = await fileUtils.dirExists(tempDir);
        let mkdirStatus;
        if(status){
            mkdirStatus = await fileUtils.mkdir(dir);
        }
        return mkdirStatus;
    }

}
module.exports = fileUtils;
