
const request = require('request');
const valid   = require('./tools/valid');

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

    let url = 'https://va4.godsold.com/3zb/zb1263SMD/index.m3u8?sign=4e56e85121cc3d4aef93c56c992adb68&t=1586768089';

    let exist = await new valid(url).urlFormat();
    console.log(exist);

}

testValidUrl();
