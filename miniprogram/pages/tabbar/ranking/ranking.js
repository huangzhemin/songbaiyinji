// miniprogram/pages/tabbar/ranking/ranking.js
const util = require('../../../util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userRankingList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    wx.showLoading({
      title: '加载中..',
    });

    //进入页面，这里无需登录，直接拉取先在排行榜前100用户信息，并展示
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'tcbDatabase',
      // 传递给云函数的参数
      data: {
        $url: "batchGetUserPointsRankingList",
      }
    }).then(res => {
      console.log('batchGetUserPointsRankingList:', res.result.data.data);
      this.setData({
        userRankingList: res.result.data.data,
      });
      wx.hideLoading();
    });
  },
})