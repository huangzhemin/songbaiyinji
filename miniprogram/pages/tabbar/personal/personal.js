// miniprogram/pages/tabbar/personal/personal.js
const util = require("../../../util")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    taskList: [],
    userInfo: {
      sdkUserInfo: {
        avatarUrl: '',
        nickName: '',
      },
      customUserInfo: {
        userRanking: '',
        userPoints: '',
      },
    },
  },

  onLoad: function(options) {
    // // Do some initialize when page load.
    wx.showLoading({
      title: '加载中...',
    })

    var that = this;
    util.getCurrentUserInfo({
      success: function(openId, userInfoRes) {
        let currentUserInfo = userInfoRes.data[0];
        that.p_refreshPersonalPage(openId, currentUserInfo);
      },
      fail: function(err) {
        console.error(err);
        wx.showToast({
          title: '请登录',
        })
        wx.hideLoading();
      }
    })
  },

  refreshPersonalPage: function(event) {
    this.p_refreshPersonalPage(event.detail.openId, event.detail.userInfo);
  },

  p_refreshPersonalPage: function(openId, userInfo) {
    let currentUserInfo = userInfo;
    let that = this;
    util.getCurrentUserTaskList({
      openId: openId,
      success: function(taskInfoRes) {
        // console.log(currentUserInfo);
        // console.log(taskInfoRes);
        that.setData({
          //当前用户的openId
          openId: openId,
          //用户头像数据
          ['userInfo.sdkUserInfo.avatarUrl']: currentUserInfo['avatarUrl'],
          ['userInfo.sdkUserInfo.nickName']: currentUserInfo['nickName'],
          ['userInfo.customUserInfo.userRanking']: 1,//currentUserInfo['userRanking'], warning 此处需要在计算排名之后，做赋值
          ['userInfo.customUserInfo.userPoints']: 100,//currentUserInfo['userPoints'],
          //用户任务列表数据
          taskList: util.batchConvertDatabaseTaskToInnerTask(taskInfoRes.data),
        })
        wx.hideLoading();
      }
    });
  },

  // 跳转至消息页
  onMsgClick: function(event) {
    wx.navigateTo({
      url: '/pages/msgDetail/msgDetail',
    })
  }
})