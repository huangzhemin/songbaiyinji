// miniprogram/pages/tabbar/personal/personal.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskList: [
      {
        taskTitle:'这是任务标题任务标题任务标题',
        taskDesc: '这是任务描述这是任务描述这是任务描述这是任务描述',
        status: '0',
        thumbImg: '/images/create-collection.png',
      },
      {
        taskTitle:'这是任务标题任务标题任务标题',
        taskDesc: '这是任务描述这是任务描述这是任务描述这是任务描述',
        status: '1',
        thumbImg: '/images/create-collection.png',
      },
      {
        taskTitle:'这是任务标题任务标题任务标题',
        taskDesc: '这是任务描述这是任务描述这是任务描述这是任务描述',
        status: '3',
        thumbImg: '/images/create-collection.png',
      },
    ],
    userInfo: {
      sdkUserInfo: {
        avatarUrl: 'https://b.yzcdn.cn/vant/icon-demo-1126.png',
        nickName: '小黄',
      },
      customUserInfo: {
        userRanking: '1',
        userPoints: '100',
      },
    },
  },

  onLoad: function(options) {
    // Do some initialize when page load.
    wx.getStorage({
      key: 'openid',
    }).then(res => {
      userInfo.where({
        _openid: res.data // 填入当前用户 openid
      }).get().then(userInfoRes => {
        let currentUserInfo = userInfoRes.data[0];
        this.setData({
          ['userInfo.sdkUserInfo.avatarUrl']: currentUserInfo['avatarUrl'],
          ['userInfo.sdkUserInfo.nickName']: currentUserInfo['nickName'],
          ['userInfo.customUserInfo.userRanking']: currentUserInfo['userRanking'],
          ['userInfo.customUserInfo.userPoints']: currentUserInfo['userPoints'],
        })
      }).catch(err => {
        console.error(err)
      })
    })
  },
})