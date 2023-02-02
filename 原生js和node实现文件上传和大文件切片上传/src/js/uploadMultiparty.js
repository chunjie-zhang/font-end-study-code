// 多文件上传 [FORM-DATA]
const uploadMultiparty= function () {
  let upload = document.querySelector('#upload5'),
      upload_inp= upload.querySelector('.upload_ipt'),
      upload_button_select = upload.querySelector('.upload_button.select'),
      upload_button_upload = upload.querySelector('.upload_button.upload'),
      upload_list = upload.querySelector('.upload_list');
  let _files = undefined;

  // 清除文件list
  const clearFile = function () {
    upload_list.style.display = 'none';
    upload_list.innerHTML = '';
    _files = [];
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
  
  // 点击选择文件按钮，触发上传文件input框选文件的行为
  upload_button_select.addEventListener('click', function () {
    if (upload_button_select.classList.contains('disabled') || upload_button_upload.classList.contains('loading')) return;

    upload_inp.click();
  });

  // 移除元素的点击处理
  upload_list.addEventListener('click', function (e) {
    let target = e.target,
        currentLi = undefined,
        key = undefined;

    if (target.tagName === 'EM') {
      currentLi = target.parentNode.parentNode;
      if (!currentLi) return;
      key = currentLi.getAttribute('key');
      upload_list.removeChild(currentLi);
      _files = _files.filter((item) => item.key !== key);
      if (_files.length === 0) {
        upload_list.style.display = 'none';
      }
      console.log(_files);
    }
  });

  // 监听用户选择文件的操作
  upload_inp.addEventListener('change', function () {
    // 获取用户选择的文件对象
    // name：文件名 size：文件大小 type: 文件的MIME类型
    let files = Array.from(upload_inp.files);

    console.log(files);

    // 如果没有上传
    if (files.length === 0) return;

    // // 限制文件的上传类型
    // if (!/(PNG|JPG|JPEG)/i.test(file.type)) {
    //   alert('上传的文件只能是PNG/JPG/JPEG 格式的~');
    //   return;
    // }

    // // 限制文件的上传的大小不超过2M
    // if (file.size > 2 * 1024 * 1024) {
    //   alert('上传的文件不能超过2MB~');
    //   return;
    // }

    // 给每一个文件增加一个唯一值,用于删除文件
    files = files.map((file) => {
      return {
        file,
        filename: file.name,
        key: createRandom(),
      }
    })

    _files = files;

    let listItemDom = '';

    files.forEach((item, index) => {
      listItemDom += `<li key="${item.key}">
        <span>文件${index + 1}：${item.filename}</span>
        <span><em>移除</em></span>
      </li>`
    });

    // 上传成功显示上传的文件list
    upload_list.innerHTML = listItemDom;

    upload_list.style.display = 'block';
  });

  // 上传文件到服务器
  upload_button_upload.addEventListener('click', function () {
    let upload_list_li = Array.from(upload_list.querySelectorAll('li'));

    if (upload_button_select.classList.contains('disabled') || upload_button_upload.classList.contains('loading')) return;

    if (_files.length === 0) {
      alert('请先选择文件进行上传~');
      return;
    }

    handleBtnDisable(true);

    const _filesArr = _files.map((item) => {
      let formData = new FormData(),
          currentLi = upload_list_li.find( li => li.getAttribute('key') === item.key),
          currentSpan = currentLi ? currentLi.querySelector('span:nth-last-child(1)') : '';
      formData.append('file', item.file);
      formData.append('filename', item.filename);

      // 将文件上传到服务器
      return instance.post('/upload_single', formData, {
        // 进度条
        onUploadProgress (e) {
          const process = (e.loaded / e.total * 100).toFixed(2);
          if (currentSpan) {
            currentSpan.innerHTML = process + '%';
          }
        }
      }).then(data => {
        if (+data.code === 200) {
          currentSpan.innerHTML = '100%';
          return;
          // alert(`文件已经上传成功，您可以基于 ${data.servicePath} 访问这个资源`)
        }
        return Promise.reject(data.msg);
      })
    });

    Promise.all(_filesArr).then(() => {
      alert('恭喜您，所有文件都上传成功~~');
    }, () => {
      alert('很遗憾，上传过程中出现问题，请稍后再试~~');
    }).finally(() => {
      // 最后都清除文件和重置状态
      clearFile();
      handleBtnDisable(false);
    });
  });
}

uploadMultiparty();