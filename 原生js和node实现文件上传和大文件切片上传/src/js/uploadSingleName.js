
/**
 * 前端展示缩略图
 */
const uploadSingleName = function () {
  let upload = document.querySelector('#upload3'),
      upload_inp= upload.querySelector('.upload_ipt'),
      upload_button_select = upload.querySelector('.upload_button.select'),
      upload_button_upload = upload.querySelector('.upload_button.upload'),
      upload_abbre = upload.querySelector('.upload_abber'),
      upload_abbre_img = upload_abbre.querySelector('img');
  let _file = undefined;

  /**
   *  将图片转为base64格式的数据
   * @param {*} file 文件对象
   * @returns 
  */
  const changeBASE64 = async (file) => {
    return new Promise((resolve, reject) => {
      // 将图片转为base64格式的数据，web端提供的方法，不能用于node
      let fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = ev => {
        resolve(ev.target.result);
      };
    });
  };

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
        resolve({
          buffer,
          hashName,
          suffix,
          filename: `${hashName}.${suffix}`
        });
      };
    });
  };

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
  
  // 点击选择文件按钮，触发上传文件input框选文件的行为
  upload_button_select.addEventListener('click', function () {
    if (upload_button_select.classList.contains('disabled') || upload_button_upload.classList.contains('loading')) return;

    upload_inp.click();
  });

  // 监听用户选择文件的操作
  upload_inp.addEventListener('change', async function () {
    // 获取用户选择的文件对象
    // name：文件名 size：文件大小 type: 文件的MIME类型
    let file = upload_inp.files[0],
        BASE64 = undefined;

    // 如果没有上传
    if (!file) return;

    // 限制文件的上传类型
    if (!/(PNG|JPG|JPEG)/i.test(file.type)) {
      alert('上传的文件只能是PNG/JPG/JPEG 格式的~');
      return;
    }

    // 限制文件的上传的大小不超过2M
    if (file.size > 2 * 1024 * 1024) {
      alert('上传的文件不能超过2MB~');
      return;
    }

    _file = file;

    // 文件预览，就是把文件对象转换为base64，赋值给src属性即可
    // 将图片转为base64格式的数据
    BASE64 = await changeBASE64(file);

    upload_abbre_img.style.display = 'block';
    upload_button_select.classList.add('disabled');
    upload_abbre_img.src = BASE64;
    upload_abbre_img.onload = () => {
      upload_button_select.classList.remove('disabled');
    }
  });

  // 上传文件到服务器
  upload_button_upload.addEventListener('click', async function () {
    if (upload_button_select.classList.contains('disabled') || upload_button_upload.classList.contains('loading')) return;

    if (!_file) {
      alert('请先选择文件进行上传~');
      return;
    }

    handleBtnDisable(true);

    // 生成文件的hash名
    const bufferObj = await changeBuffer(_file);

    let formData = new FormData();
    formData.append('file', _file);
    formData.append('filename', bufferObj.filename);

    // 将文件上传到服务器
    instance.post('/upload_single_name', formData).then(data => {
      if (+data.code === 200) {
        alert(`文件已经上传成功，您可以基于 ${data.servicePath} 访问这个资源`)
      } else {
        alert(data.msg || '文件上传失败，请您稍后再试')
      }
    }).catch(error => {
      alert('文件上传失败，请您稍后再试')
    }).finally(() => {
      // 最后都清除文件和重置状态
      upload_abbre_img.style.display = 'none';
      upload_abbre_img.src = '';
      handleBtnDisable(false);
    });
  });
};

uploadSingleName();