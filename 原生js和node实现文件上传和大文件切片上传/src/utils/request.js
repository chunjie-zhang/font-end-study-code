/*
 * @Author: zhangchunjie8 zhangchunjie8@jd.com
 * @Date: 2023-01-28 11:15:35
 * @LastEditors: zhangchunjie8 zhangchunjie8@jd.com
 * @LastEditTime: 2023-01-31 10:33:33
 */

let instance = axios.create();

instance.defaults.baseURL = CONFIG_ENUM.base_url + ':' + CONFIG_ENUM.base_url_port;

instance.defaults.headers['Content-Type'] = 'multipart/form-data';

/**
 * 对application/x-www-form-urlencoded类型的内容进行参数处理
 * @param {*} data 请求参数
 * @param {*} headers 请求头部配置
 * @returns 
 */
instance.defaults.transformRequest = (data, headers) => {
  const contentType = headers['Content-Type'];

  if (contentType === CONFIG_ENUM.content_type_urlencoded) {
    return Qs.stringify(data)
  };

  return data;
}

// 对响应的数据进行处理
instance.interceptors.response.use((res) => {
  return res.data
}, (error) => {
  return Promise.reject(error)
});


