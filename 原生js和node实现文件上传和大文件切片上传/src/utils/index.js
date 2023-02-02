/*
 * @Author: zhangchunjie8 zhangchunjie8@jd.com
 * @Date: 2023-02-01 10:34:58
 * @LastEditors: zhangchunjie8 zhangchunjie8@jd.com
 * @LastEditTime: 2023-02-01 10:35:01
 */
/**
 * 生成随机数
 * @returns
 */
const createRandom = () => {
  let ran = Math.random() * new Date()
  return ran.toString(16).replace('.', '')
}