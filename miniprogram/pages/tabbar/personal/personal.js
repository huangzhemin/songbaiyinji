const util = require("../../../util")

// miniprogram/pages/tabbar/personal/personal.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    taskList: [
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
    var that = this;
    util.getCurrentUserInfo({
      success: function(openId, userInfoRes) {
        let currentUserInfo = userInfoRes.data[0];
        that.setData({
          openId: openId,
          ['userInfo.sdkUserInfo.avatarUrl']: currentUserInfo['avatarUrl'],
          ['userInfo.sdkUserInfo.nickName']: currentUserInfo['nickName'],
          ['userInfo.customUserInfo.userRanking']: currentUserInfo['userRanking'],
          ['userInfo.customUserInfo.userPoints']: currentUserInfo['userPoints'],
        })
      },
      fail: function(err) {
        console.error(err)
      }
    })
  },

  // 跳转至消息页
  onMsgClick: function(event) {
    wx.navigateTo({
      url: '/pages/msgDetail/msgDetail',
    })
  }
})