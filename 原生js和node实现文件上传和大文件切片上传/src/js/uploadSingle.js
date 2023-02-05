/*
 * @Author: zhangchunjie8 zhangchunjie8@jd.com
 * @Date: 2023-01-28 15:22:54
 * @LastEditors: zhangchunjie8 zhangchunjie8@jd.com
 * @LastEditTime: 2023-02-02 21:43:04
 */

// 单一文件上传 [FORM-DATA]
const uploadSingle = function () {
  let upload = document.querySelector('#upload1'),
      upload_inp= upload.querySelector('.upload_ipt'),
      upload_button_select = upload.querySelector('.upload_button.select'),
      upload_button_upload = upload.querySelector('.upload_button.upload'),
      upload_tip = upload.querySelector('.upload_tip'),
      upload_list = upload.querySelector('.upload_list');
  let _file = undefined;

  // 清除文件list
  const clearFile = function () {
    upload_list.style.display = 'none';
    upload_list.innerHTML = '';
    _file = undefined;
  }

  /**
   * 控制按钮的状态
   * @param {*} flag true 为不可选，false可选
   */
  const handleBtnDisable = function(flag) {
    if (flag) {
      upload_button_select.classList.add('disabled');
      upload_button_upload.classList.add('loading');
      return;
    }
    upload_button_select.classList.remove('disabled');
    upload_button_upload.classList.remove('loading');
  }

  // 上传文件到服务器
  upload_button_upload.addEventListener('click', function () {
    if (upload_button_select.classList.contains('disabled') || upload_button_upload.classList.contains('loading')) return;

    if(!_file) {
      alert('请先选择文件进行上传~');
      return;
    }

    handleBtnDisable(true);


    let formData = new FormData();
    formData.append('file', _file);
    formData.append('filename', _file.name);

    // 将文件上传到服务器
    instance.post('/upload_single', formData).then(data => {
      if (+data.code === 200) {
        alert(`文件已经上传成功，您可以基于 ${data.servicePath} 访问这个资源`)
      } else {
        alert(data.msg || '文件上传失败，请您稍后再试')
      }
    }).catch(error => {
      alert('文件上传失败，请您稍后再试')
    }).finally(() => {
      // 最后都清除文件和重置状态
      clearFile();
      handleBtnDisable(false);
    });
  });


  
  // 点击选择文件按钮，触发上传文件input框选文件的行为
  upload_button_select.addEventListener('click', function () {
    if (upload_button_select.classList.contains('disabled') || upload_button_upload.classList.contains('loading')) return;

    upload_inp.click();
  });

  // 移除元素的点击处理
  upload_list.addEventListener('click', function (e) {
    let target = e.target;
    if (target.tagName === 'EM') {
      clearFile();
    }
  });

  // 监听用户选择文件的操作
  upload_inp.addEventListener('change', function () {
    // 获取用户选择的文件对象
    // name：文件名 size：文件大小 type: 文件的MIME类型
    let file = upload_inp.files[0]

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

    upload_list.style.display = 'block';
    // 上传成功显示上传的文件list
    upload_list.innerHTML = `<li>
      <span>文件：${file.name}</span>
      <span><em>移除</em></span>
    </li>`;

    _file = file;
  });
};

uploadSingle();