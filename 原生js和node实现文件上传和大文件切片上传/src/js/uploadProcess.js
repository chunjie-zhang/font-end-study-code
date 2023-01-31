/*
 * @Author: zhangchunjie8 zhangchunjie8@jd.com
 * @Date: 2023-01-31 16:10:22
 * @LastEditors: zhangchunjie8 zhangchunjie8@jd.com
 * @LastEditTime: 2023-01-31 21:02:49
 */

// 单一文件上传 [进度条管控]
const uploadProcess = function () {
  let upload = document.querySelector('#upload4'),
    upload_inp= upload.querySelector('.upload_ipt'),
    upload_button_select = upload.querySelector('.upload_button.select'),
    upload_process = upload.querySelector('.upload_progress'),
    upload_progress_line = upload_process.querySelector('.progress');

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
    if (file.size > 2 * 1024 * 1024) {
      alert('上传的文件不能超过2MB~');
      return;
    }

    try {
      upload_button_select.classList.add('loading');

      let formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);

      data = await instance.post('/upload_single', formData, {
        // axios是基于xmlHttpRequest的,他有一些回调函数如upload下的onabort,onprogress等，onUploadProgress就是onprogress
        // xhr.upload.onprogress 文件上传中的回调
        onUploadProgress (ev) {
          let { loaded, total } = ev;

          upload_process.style.display = 'block';
          upload_progress_line.style.width = `${(loaded / total) * 100}%`;

          console.log(ev);
        }
      });

      if (+data.code === 200) {
        upload_progress_line.style.width = `100%`;
        alert(`文件已经上传成功，您可以基于 ${data.servicePath} 访问该文件~`);
        return;
      } else {
        alert(data.msg || '上传失败');
      }

    } catch (error) {
      console.log(error);
      alert('上传错误');
    } finally {
      upload_process.style.display = 'none';
      upload_progress_line.style.width = `0%`;
      upload_button_select.classList.remove('loading');
    }
  });
}

uploadProcess();