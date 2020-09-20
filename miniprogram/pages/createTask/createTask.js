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
    let that = this;
    util.getCurrentUserOpenId({
      success: function(currentUserOpenId) {
        that.setData({
          openId: currentUserOpenId,
          taskId: '',
        });
      },
      fail: function(err) {
        that.setData({
          openId: '',
          taskId: '',
        });
      }
    })
  },
})