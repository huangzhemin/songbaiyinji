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

  onShow: function() {
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
          ['userInfo.customUserInfo.userRanking']: 'x',//currentUserInfo['userRanking'], 
          ['userInfo.customUserInfo.userPoints']: currentUserInfo['points'],
          //用户任务列表数据
          taskList: util.batchConvertDatabaseTaskToInnerTask(taskInfoRes.data),
        })
        wx.hideLoading();
      }
    });
  },

  // 跳转至消息页
  onMsgClick: function(event) {
    let that = this;
    wx.navigateTo({
      url: '/pages/msgDetail/msgDetail',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { 
          'openId': that.data.openId,   //类似'oBG1A5f75CT8Bj1gAG4OMkXgDyXM',
        })
      }
    });
  }
})