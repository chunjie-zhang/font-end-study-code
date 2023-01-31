/*
 * @Author: zhangchunjie8 zhangchunjie8@jd.com
 * @Date: 2023-01-31 10:49:35
 * @LastEditors: zhangchunjie8 zhangchunjie8@jd.com
 * @LastEditTime: 2023-01-31 10:50:01
 */
/**
 * 单一文件上传 [BASE64]
 */
const uploadSingleBase64 = function () {
  let upload = document.querySelector('#upload2'),
      upload_inp= upload.querySelector('.upload_ipt'),
      upload_button_select = upload.querySelector('.upload_button.select');

  /**
   * 是否是处于可操作状态
   * @param {*} element 
   * @returns 
   */
  const checkIsDisabled = element => {
    return (element.classList.contains('loading'));
  }

  /**
   *  将图片转为base64格式的数据
   * @param {*} file 文件对象
   * @returns 
   */
  const changeBASE64 = (file) => {
    return new Promise((resolve, reject) => {
        // 将图片转为base64格式的数据
        let fileReader = new FileReader();
        fileReader.readAsDataURL(file)
        fileReader.onload = ev => {
          resolve(ev.target.result)
        }
    })
  }

  // 点击选择文件按钮，触发上传文件input框选文件的行为
  upload_button_select.addEventListener('click', function () {
    if (checkIsDisabled(upload_button_select)) return;
    upload_inp.click();
  });

  // 监听用户选择文件的操作
  upload_inp.addEventListener('change', async () =>{
    // 获取用户选择的文件对象
    // name：文件名 size：文件大小 type: 文件的MIME类型
    let file = upload_inp.files[0],
        BASE64 = undefined,
        data = undefined;

    upload_button_select.classList.add('loading');
    

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

    // 将图片转为base64格式的数据
    BASE64 = await changeBASE64(file);

    try {
      data = await instance.post('/upload_single_base64', {
        file: encodeURIComponent(BASE64),
        filename: file.name,
      }, {
        headers: {
          'Content-Type': CONFIG_ENUM.content_type_urlencoded,
        }
      });
      if (+data.code === 200) {
        alert(`文件已经上传成功，您可以基于 ${data.servicePath} 访问这个资源`);
      } else {
        alert(data.msg || '文件上传失败，请您稍后再试');
      }
    } catch (error) {
      console.log(error);
      alert('文件上传失败，请您稍后再试');
    } finally {
      upload_button_select.classList.remove('loading');
    }
  });
};

uploadSingleBase64();