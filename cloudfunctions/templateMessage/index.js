// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.templateMessage.send({
      touser: cloud.getWXContext().OPENID,
      page: 'pages/index/index',
      data: {
        keyword1: {
          value: 'TIT时尚公寓'
        },
        keyword2: {
          value: '2015年01月05日 12:30'
        },
        keyword3: {
          value: '800元'
        },
        keyword4: {
          value: '广州市海珠区新港中路397号'
        },
        keyword5: {
          value: '88号'
        },
        keyword6: {
          value: '2016年9月8日'
        }
      },
      templateId: '9p4ujvCXFPDGv24J-F9q-oyWcds6vmHsFe5eQ9q5wQw',
      formId: event.formId,
      emphasisKeyword: 'keyword1.DATA'
    })
    console.log('hh', event)
    console.log('result', result)
    return result
  } catch (err) {
    console.log('error', err)
    return err
  }
}