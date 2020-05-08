
const request = require('request');
const fs      = require('fs');
const valid   = require('./tools/valid');
const http    = require('http');
const https    = require('https');
const cmd     = require('./tools/cmdHandler');
const ejsUtil      =require('./tools/ejsUtil');
const path     = require('path');
const fileUtil  = require('./tools/fileUtils');
const utils     = require('./tools/utils');

function testUrl() {

    let options = {
        url:'http://interface.my91apimy.com:8080/api.php',
        from:{
            timestamp: '1582347687',
            data: '0EB44C7F3C20A63808D6C2237D6F1A5FC64F2074D08F8339CC26C74A171D29D99EDCE379AB7F94CF50ECF95CAD938DCD65E881DF2C0B7F71FE15185F7CA1016E4FD500A14C90C4D14967BD45E95F505688583D130E1712DEF5BB750DFE479F602F78E02A0C37A12A9D874C7478006D5867B9905ADCF46DA3974232DE8A107A11FB70307C3AE60BAA10E49B812452D61F843A095ECDBC7B0977251D853A70D5DEB6547C9800222ABE215541CFE32CF7A452C2BB444FFE97D62D4E8071',
            sign: '8bfb341cb4a4e4bb80603513b88b5943'
        }
    };

    request.post(options.url, {
        form: options.from,
    }, (err, res, body) => {
        console.log('body:'+body)
    });


}

async function testValidUrl() {

    let url = 'https://va4.godsold.com/video/343GFF/343GFF.m3u8?sign=f5b3f649694908f3547b0fd2f6d44878&t=1586772919';

    let exist = await new valid(url).urlFormat();
    console.log(exist);

}

function downloadMp4() {
    // let url = 'http://www.xiaobi015.com/get_file/3/82244739c914ccc77b905a685f0dca8d/73000/73343/73343.mp4/?br=326';
    // let url = 'https://d3d2kkiu3yq8kz.cloudfront.net/video/343GFF.jpg';
    let url = 'https://v1.goovvg.com:3002/remote_control.php?file=B64YTo0OntzOjQ6InRpbWUiO2k6MTU4NzAxNTQzMztzOjU6ImxpbWl0IjtpOjA7czo0OiJmaWxlIjtzOjI5OiIvdmlkZW9zLzczMDAwLzczMzQzLzczMzQzLm1wNCI7czoyOiJjdiI7czozMjoiMjlkYWUyNzYzNWFmNDY4NTM5Y2I5NTc3M2Y2YzdiZDAiO30%3D';

    let filename = './test.jpg';
    let stream = fs.createWriteStream(filename);
    const options = {
        hostname: 'v1.goovvg.com:3002',
        port: 443,
        path: '/remote_control.php?file=B64YTo0OntzOjQ6InRpbWUiO2k6MTU4NzAxNTQzMztzOjU6ImxpbWl0IjtpOjA7czo0OiJmaWxlIjtzOjI5OiIvdmlkZW9zLzczMDAwLzczMzQzLzczMzQzLm1wNCI7czoyOiJjdiI7czozMjoiMjlkYWUyNzYzNWFmNDY4NTM5Y2I5NTc3M2Y2YzdiZDAiO30%3D',
        method: 'GET',
        headers:{
            'Host':'v1.goovvg.com',
            'Connection':'keep-alive',
            'Upgrade-Insecure-Requests':1,
            'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
            'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Encoding':'gzip, deflate',
            'Accept-Language':'zh-CN,zh;q=0.9,zh-TW;q=0.8',
            // 'Cookie':'UM_distinctid=171106db37d316-0ec4fdcc4b94a-594f2116-1fa400-171106db37e9a7; __SDID=7e83351159fa1362; _ga=GA1.2.1968925474.1585118557; kt_tcookie=1; PHPSESSID=0mmm3bhp2g5790mfc5bpuf96u4; CNZZDATA1260108463=1100864302-1585115782-http%253A%252F%252Fthat3.top%252F%7C1587003285; CNZZDATA1270200948=1837498302-1585114708-http%253A%252F%252Fthat3.top%252F%7C1587003095; _gid=GA1.2.1545007083.1587004557; kt_is_visited=1; video_log=73343%3A1587004154%3B; __atuvc=52%7C13%2C0%7C14%2C5%7C15%2C2%7C16; kt_qparams=id%3D73343%26dir%3Dd-1080p6'
        }
    };

    request(url,{},function () {

    })

    // const req = http.request(options, res => {
    //     console.log(`statusCode: ${res.statusCode} `);
    //     res.pipe(stream);
    //     // res.on('data', d => {
    //     //     process.stdout.write(d)
    //     // });
    // });
    //
    // req.on('error', error => {
    //     console.error(error)
    // });
    //
    // req.end()
}

function testCmd() {
    let dir = '456';
    let filePath = 'D:\\git_project\\downloadVideo\\README.md';
    let cmdExample = new cmd();
    cmdExample.pushFile(filePath,dir)
        .then((res) => {
            console.log(`result:${res}`);
        }).catch((e) => {
            console.log(`error...${e.message}`);
    })
}


async function testEjs(){
    let path = await ejsUtil.generateM3u8Index(['111.ts','222.ts'],utils.randomBytes(10));
    console.log(path);
}

function testM3u8(){
    let res = utils.extractTsPath('https://p.gxmy66.com/user/2d165751bd4f67d56ed847c32d34c/165751816bd4f67d56ed847c32d34c_000.ts?auth_key=1588990973-0-0-a83186391832ee062e191efb5cd9');
    console.log(res);
}

function testFile() {
    let data = 'Xiaoming';
    fileUtil.writeFileAsync(path.join(__dirname,'./111.m3u8'),data);
    console.log(`Write file success`);
}
testM3u8();
