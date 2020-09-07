// miniprogram/pages/test/test.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  updateRankingList: function() {
    console.log('test');
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: "rankingUserPoints",
    }).then(res => {
      console.log('rankingUserPoints:', res);
    });

    // wx.cloud.callFunction({
    //   // 要调用的云函数名称
    //   name: "tcbDatabase",
    //   data: {
    //     $url: 'batchGetUserPointsRankingList',
    //   }
    // }).then(res => {
    //   console.log('rankingUserPoints:', res.result.data.list);
      
    //   //此处将排序后的结果写入数据库rankingUserInfo，方便小程序拉取
    //   //需要登录accesstoken接入，批量更新，
    //   // wx.cloud.callFunction({
    //   //   name: "tcbDatabase",
    //   //   data: {
    //   //     $url: 'batchWriteUserPointRankingList',
    //   //     userPointsRankingList: res.result.data.list,
    //   //   }
    //   // }).then(res1 => {
    //   //   console.log('userPointsRankingList write result', res1);
    //   // });
    // });
  }
})