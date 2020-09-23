// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: 'oBG1A5f75CT8Bj1gAG4OMkXgDyXM',
      page: 'pages/tabbar/ranking/ranking',
      lang: 'zh_CN',
      data: {
        phrase1: {
          value: '王小二'
        },
        thing2: {
          value: '总能量'
        },
        thing3: {
          value: '昨日能量'
        },
        date5: {
          value: '2019-12-26 16:00'
        },
      },
      templateId: '8WEvy8r0xt4yZ4d5MGCUN4-dlv906nDse9TQOMpQn7g',
      miniprogramState: 'developer'
    })
    return result
  } catch (err) {
    return err
  }
}