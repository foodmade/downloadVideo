const ejs      = require('ejs');
const fileUtil = require('../tools/fileUtils');
const log      = require('../config/log');
const path     = require('path');

const templatePath    = path.join(__dirname,'../template/ejs/m3u8.ejs');
const sourceFolder    = path.join(__dirname,'../../index');

class ejsUtil{

    constructor() {
    }

    /**
     * 生成m3u8索引文件
     * 自动生成到根目录index文件夹下,文件名称取10位随机数
     * @param tsArr   ts名称列表
     * @param dirName 索引文件存放目录
     */
    static generateM3u8Index(tsArr,dirName){
        return new Promise(((resolve, reject) => {
            ejs.renderFile(templatePath,{tsArr:tsArr},async function(err,data){
                if(err){
                    log.err(`GenerateM3u8Index throw exception. err message:${err}`);
                    reject(undefined);
                }else{
                    let filePath = path.join(sourceFolder,dirName);
                    let flag = await fileUtil.dirExists(filePath);
                    if(!flag){
                        log.err(`Create file or directory filed. Path:${filePath}`);
                        reject(undefined);
                    }
                    filePath = path.join(filePath,'index.m3u8');
                    console.log(`GenerateM3u8Index successful. File path:${filePath} tsLength:${tsArr.length}`);
                    fileUtil.writeFileAsync(filePath,data);
                    resolve(filePath);
                }
            })
        }))
    }

}
module.exports = ejsUtil;
