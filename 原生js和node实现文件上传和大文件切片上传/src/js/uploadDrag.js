/*
 * @Author: zhangchunjie8 zhangchunjie8@jd.com
 * @Date: 2023-02-02 21:06:51
 * @LastEditors: zhangchunjie8 zhangchunjie8@jd.com
 * @LastEditTime: 2023-02-02 21:52:00
 */
/**
 * 拖拽上传 [FORM-DATA]
 */
const uploadDrag = () => {
  let upload = document.querySelector('#dragBox'),
    upload_inp = upload.querySelector('.upload_ipt'),
    upload_button = upload.querySelector('#upload-button'),
    upload_button_upload = upload.querySelector('.upload_button.upload'),
    upload_list = upload.querySelector('.upload_list');
  let isUpload = false; // 正在加载

  /**
   * 上传图片
   * @param {*} file 文件
   */
  const uploadFile = async (file) => {
    try {
      if (isUpload) {
        alert('文件正在上传中，请您稍后再试')
      };

      let formData = new FormData(),
          data;

      formData.append('file', file);
      formData.append('filename', file.filename);

      isUpload = true;

      data = await instance.post('upload_single', formData);

      if (+data.code === 200) {
        alert(`文件已经上传成功，您可以基于 ${data.servicePath} 访问这个资源`)
      } else {
        alert(data.msg || '文件上传失败，请您稍后再试')
      }
    } catch (error) {
      console.log(error);
      alert('文件上传失败，请您稍后再试')
    } finally {
      isUpload = false;
    }
  }

  // 点击选择文件按钮，触发上传文件input框选文件的行为
  upload_button.addEventListener('click', function () {
    upload_inp.click();
  });

  // 拖拽获取
  // upload.addEventListener('dragenter', () => {
  //   console.log('进入');
  // });
  // upload.addEventListener('dragleave', () => {
  //   console.log('离开');
  // });
  upload.addEventListener('dragover', (e) => {
    console.log('区域移动');
    e.preventDefault(); // 解决放置图片后打开新页签打开问题
  });
  upload.addEventListener('drop', (e) => {
    console.log('放置到容器');
    // 解决放置图片后打开新页签打开问题
    e.preventDefault();
    let file = e.dataTransfer.files[0];

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
    uploadFile(file);
  });

  // 监听用户选择文件的操作
  upload_inp.addEventListener('change', function () {
    // 获取用户选择的文件对象
    // name：文件名 size：文件大小 type: 文件的MIME类型
    let file = upload_inp.files[0];


    // 如果没有上传
    if (file.length === 0) return;

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
    uploadFile(file);

  });
}
uploadDrag();