/*
 * @Author: zhangchunjie8 zhangchunjie8@jd.com
 * @Date: 2023-01-28 11:20:03
 * @LastEditors: zhangchunjie8 zhangchunjie8@jd.com
 * @LastEditTime: 2023-01-30 15:47:49
 */
const Controller = require('./controller');

const express = require('express'),
      fs = require('fs'),
      bodyParse = require('body-parser'),
      multiparty = require('multiparty'),
      sparkMD5 = require('spark-md5');

const app = express(),
      PORT = 8888,
      HOST = 'http://127.0.0.1',
      HOSTNAME = HOST + ':' + PORT;



/**中间件 */
/**静态资源目录 */
app.use(express.static(__dirname));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', "*");
  req.method === 'OPTIONS' ? res.send('support cors domain request!') : next();
});

app.use(bodyParse.urlencoded({
  extended: false,
  limit: '1024mb'
}));

const controller = new Controller();

/**单一文件上传 [FORM-DATA]*/
app.post('/upload_single', controller.uploadSingle);

/**单一文件上传 [BASE64] */
app.post('/upload_single_base64', controller.uploadSingleBase64)


app.listen(PORT, () => {
  console.log(`服务器${HOSTNAME}正在监听中。。。。`);
})