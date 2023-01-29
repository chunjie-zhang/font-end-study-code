/*
 * @Author: zhangchunjie8 zhangchunjie8@jd.com
 * @Date: 2023-01-29 15:13:13
 * @LastEditors: zhangchunjie8 zhangchunjie8@jd.com
 * @LastEditTime: 2023-01-29 18:25:57
 */

const multiparty = require('multiparty');

// 文件的保存地址
const uploadDir = `${__dirname}/upload`,
      PORT = 8888,
      HOST = 'http://127.0.0.1',
      HOSTNAME = HOST + ':' + PORT;

/**
 * 延迟函数
 * @param {*} time 延迟时间
 * @returns 
 */
const delay = (time = 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  })
}

/**
 * 基于multiparty插件实现文件上传处理 & form-data解析
 * @param {*} req 
 * @param {*} auto 是否用插件上传图片
 */
const multipartyUpload = function (req, auto) {
  auto = (typeof auto !== "boolean") ? false : auto;

  let config = {
    // 限制文件最大200mb
    maxFieldSize: 200 * 1024 * 1024,
  };

  // 用multiparty自动上传图片到指定位置
  if (auto) config.uploadDir = uploadDir;

  return new Promise(async (resolve, reject) => {
    await delay();
    new multiparty.Form(config).parse(req, ( err, fields, files) => {
      if (err) {
        reject(err)
        return;
      }
      resolve({fields, files});
    });
  });
};

/**
 * controller层对外暴露的api处理函数
 */
module.exports = class Controller {
  /**
   * 单一文件上传 [FORM-DATA]
   * @param {*} req 
   * @param {*} res 
   */
  async uploadSingle (req, res) {
    try {
      let { fields, files } = await multipartyUpload(req, true);
      let file = (files.file && files.file[0]) || {};
      res.send({
        code: 200,
        originalFilename: file.originalFilename,
        servicePath: file.path.replace(__dirname, HOSTNAME),
        msg: '上传成功'
      });
    } catch (error) {
      res.send({
        code: 400,
        msg: error,
      })
    }
    console.log(11111);
  }
}