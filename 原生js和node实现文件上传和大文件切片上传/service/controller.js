/*
 * @Author: zhangchunjie8 zhangchunjie8@jd.com
 * @Date: 2023-01-29 15:13:13
 * @LastEditors: zhangchunjie8 zhangchunjie8@jd.com
 * @LastEditTime: 2023-01-31 17:16:36
 */

const multiparty = require('multiparty'),
      SparkMD5 = require('spark-md5'),
      fs = require('fs');

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
 * 判断是否存在该文件
 * @param {*} path 
 * @returns 
 */
const exists = function (path) {
  return new Promise((resolve, reject) => {
    // 判断文件目录和文件是否存在
    fs.access(path, fs.constants.F_OK, err => {
      if (err) {
        resolve(false);
      }
      resolve(true);
    })
  })
}

/**
 * 创建文件并写入到指定的目录&返回客户端结果
 * @param {*} res 
 * @param {*} path 
 * @param {*} file 
 * @param {*} filename 
 * @param {*} stream 
 * @returns 
 */
const writeFile = function (res, path, file, filename, stream) {
  return new Promise((resolve, reject) => {
    if (stream) {
      // path = file.path;
    }
    fs.writeFile(path, file, err => {
      if (err) {
        reject(err);
        res.send({
          code: 400,
          msg: "文件上传失败",
        });
        return;
      };
      resolve();
      res.send({
        code: 200,
        msg: "文件上传成功",
        originalFilename: filename,
        servicePath: path.replace(__dirname, HOSTNAME),
      });
    });
  });
};

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
    // 解析formData数据，处理文件上传
    new multiparty.Form(config).parse(req, (err, fields, files) => {
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
  /**s
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
  };

  /**
   * 单一文件上传 [BASE64] 处理文件名称，也做文件名的匹配去重处理
   * @param {*} req 
   * @param {*} res 
   */
  async uploadSingleBase64 (req, res) {
    try {
      let file = req.body.file,
          filename = req.body.filename,
          spark = new SparkMD5.ArrayBuffer(), // 根据文件内容生成hash
          suffix = /\.([0-9a-zA-Z]+)$/.exec(filename)[1], // 截取文件后缀
          isExists = false,
          path = undefined;

      file = decodeURIComponent(file);
      // 将base64转成正常的文件格式
      file = file.replace(/^data:image\/\w+;base64,/, "");
      // 将base64数据变为文件（buffer）数据
      file = Buffer.from(file, 'base64');
      // 添加文件
      spark.append(file);
      // 生成唯一的文件path spark.end根据文件数据生成唯一的hash值
      path = `${uploadDir}/${spark.end()}.${suffix}`;

      await delay();

      // 判断文件是否存在
      isExists = await exists(path);

      if (isExists) {
        res.send({
          code: 200,
          msg: "文件已经存在",
          originalFilename: filename,
          servicePath: path.replace(__dirname, HOSTNAME),
        });
        return;
      }
      // 写入文件
      writeFile(res, path, file, filename, file);
    } catch (error) {
      res.send({
        code: 404,
        msg: "服务器内部错误",
      });
    }
  };

  /**
   * 单一文件上传 [缩略图]， 不处理文件名称由前端传，也做文件名的匹配去重处理
   * @param {*} req 
   * @param {*} res 
   */
  async uploadSingleName (req, res) {
    try {
      let { fields, files } = await multipartyUpload(req);
      let filename = (fields.filename && fields.filename[0]) || '',
          file = (files.file && files.file[0]) || {},
          path = uploadDir + '/' + filename,
          isExists = false;
      
      // 检测是否存在
      isExists = await exists(path);

      if (isExists) {
        res.send({
          code: 200,
          msg: '文件已经存在',
          originalFilename: filename,
          servicePath: path.replace(__dirname, HOSTNAME),
        });
        return;
      }

      writeFile(res, path, file, filename, true);

    } catch (error) {
      console.log(error);
      res.send({
        code: 404,
        msg: "服务器内部错误",
      });
    };
  };
  
};