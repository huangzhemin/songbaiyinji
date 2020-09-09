// miniprogram/pages/createTask/createTask.js
var util = require('../../util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  onTabItemTap: function(item) {
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
      }
    });
  },
})