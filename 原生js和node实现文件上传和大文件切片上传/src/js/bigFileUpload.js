/*
 * @Author: zhangchunjie8 zhangchunjie8@jd.com
 * @Date: 2023-01-31 16:10:22
 * @LastEditors: zhangchunjie8 zhangchunjie8@jd.com
 * @LastEditTime: 2023-02-09 17:45:21
 */

// 大文件分片上传 [FORM-DATA]
const bigFileUpload = function () {
  let upload = document.querySelector('#upload7'),
    upload_inp= upload.querySelector('.upload_ipt'),
    upload_button_select = upload.querySelector('.upload_button.select'),
    upload_progress = upload.querySelector('.upload_progress'),
    upload_progress_line = upload_progress.querySelector('.progress');

  /**
   * 是否是处于可操作状态
   * @param {*} element 
   * @returns 
   */
  const checkIsDisabled = element => {
    return (element.classList.contains('loading'));
  }

  /**
  * 控制按钮的状态
  * @param {*} flag true 为不可选，false可选
  */
  const handleBtnDisable = function (flag) {
    if (flag) {
      upload_button_select.classList.add('disabled');
      upload_button_upload.classList.add('loading');
      return;
    }
    upload_button_select.classList.remove('disabled');
    upload_button_upload.classList.remove('loading');
  }

    /**
   * 将文件转换为buffer流并且转为唯一的hash值
   * @param {*} file 
   * @returns 
   */
  const changeBuffer = async (file) => {
    return new Promise((resolve, reject) => {
      // 将图片转为base64格式的数据，web端提供的方法，不能用于node
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = ev => {
        let buffer = ev.target.result,
            // 将buffer流转为唯一的hash值
            spark = new SparkMD5.ArrayBuffer(),
            hashName,
            suffix;

        spark.append(buffer);
        hashName = spark.end();
        suffix = /\.([a-zA-Z0-9]+)$/.exec(file.name)[1];
        console.log({
          buffer,
          hashName,
          suffix,
          filename: `${hashName}.${suffix}`
        });
        resolve({
          buffer,
          hashName,
          suffix,
          filename: `${hashName}.${suffix}`
        });
        return;
      };
    });
  };

  // 点击选择文件按钮，触发上传文件input框选文件的行为
  upload_button_select.addEventListener('click', function () {
    if (upload_button_select.classList.contains('loading')) return;

    upload_inp.click();
  });

  // 监听用户选择文件的操作
  upload_inp.addEventListener('change', async function () {
    // 获取用户选择的文件对象
    // name：文件名 size：文件大小 type: 文件的MIME类型
    let file = upload_inp.files[0],
        data = undefined;

    // 如果没有上传
    if (!file) return;

    // 限制文件的上传类型
    if (!/(PNG|JPG|JPEG)/i.test(file.type)) {
      alert('上传的文件只能是PNG/JPG/JPEG 格式的~');
      return;
    }

    // 限制文件的上传的大小不超过2M
    if (file.size > 20 * 1024 * 1024) {
      alert('上传的文件不能超过20MB~');
      return;
    }

    upload_button_select.classList.add('loading');
    upload_progress.style.display = 'block';

    let already = [],
        { hashName, suffix} = await changeBuffer(file);
        
    try {
      data = await instance.get('/upload_already', {
        params: {
          hashName,
        }
      });

      if (+data.code) {
        already = data.fileList;
      }
    } catch (error) {
      console.log(error);
    }
    // 实现文件切片处理 【1.固定数量，2.固定大小】
    let maxSize = 1024 * 100, // 切片尺寸
        maxCount = 100, // 切片最大数量
        count = Math.ceil(file.size / maxSize), // 切片数量
        index = 0, // 切片索引
        chunk = [];

    // 开始的时候是固定大小，如果切片数量大于maxCount,就用固定数量
    if (count > 100) {
      maxSize = file.size / maxCount;
      count = maxCount;
    }

    while ( index < count) {
      chunk.push({
        file: file.slice(index * maxSize, (index + 1) * maxSize),
        filename: `${hashName}_${index}.${suffix}`,
      });
      index ++;
    }
    // 切片完清除index = 0
    index = 0

    // 清除上传的状态
    const clear = () => {
      upload_button_select.classList.remove('loading');
      upload_progress.style.display = 'none';
      upload_progress_line.style.width = '0%';
    }

    // 上传成功的处理
    const complete = async () => {
      // 管理进度条
      index ++;
      upload_progress_line.style.width = `${index / count * 100}%`

      // 当所有的切片都上传成功，我们合并切片
      if (index < count) return; 
      upload_progress_line.style.width = '100%';
      
      try {
        data = await instance.post('/upload_merge', {
          hashName,
          count,
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
        if (+data.code === 200) {
          alert(`恭喜您，文件上传成功，您可以基于${data.servicePath}访问文件~~`);
          clear();
          return;
        }
        throw data;
      } catch (error) {
        console.log(error);
        console.log(error.msg || '切片合并失败，请稍后再试~~');
        clear();
      }
    };

    // 把每个切片上传到服务器
    chunk.forEach((chunk) => {
      // 如果上传的就不需要再上传
      if (already.length > 0 && already.includes(chunk.filename)) {
        complete();
        return;
      }

      let formData = new FormData();
      formData.append('file', chunk.file);
      formData.append('filename', chunk.filename);
      instance.post('/upload_chunk', formData).then((data) => {
        if (+data.code == 200) {
          complete();
          return;
        } else {
          alert(data.msg);
        }
      }).catch((error) => {
        console.log('上传切片失败，请稍后再试~~');
        clear();
      });
    });

  });
}

bigFileUpload();