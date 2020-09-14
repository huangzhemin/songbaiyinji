// miniprogram/pages/createTask/createTask.js
var util = require('../../util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  onLoad: function(options) {
    this.p_getCurrentUserInfoForCreateTask();
  },

  onTabItemTap: function(item) {
    this.p_getCurrentUserInfoForCreateTask();
  },

  p_getCurrentUserInfoForCreateTask: function() {
    wx.showLoading({
      title: '加载中..',
    });

    let that = this;
    util.getCurrentUserInfo({
      success: function(currentUserOpenId, userInfoRes) {
        console.log('currentUserOpenId', currentUserOpenId),
        console.log('userInfoRes', userInfoRes),
        that.setData({
          openId: currentUserOpenId,
          taskId: '',
          canJudge: userInfoRes.data[0].canJudge,
          isSelf: true,
        });
        wx.hideLoading();
      },
      fail: function(err) {
        that.setData({
          openId: '',
          taskId: '',
          canJudge: false,
          isSelf: true,
        });
        wx.hideLoading();
      }
    });
  },
})