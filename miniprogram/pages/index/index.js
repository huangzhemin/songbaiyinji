// miniprogram/pages/index/index.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')

Page({

  /**
   * 页面的初始数据
   */
  data: {
      userList:[],
      active: 0,
      icon: {
        normal: 'https://img.yzcdn.cn/vant/user-inactive.png',
        active: 'https://img.yzcdn.cn/vant/user-active.png',
      }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userInfo.get().then(res => {
      console.log(res);
      this.setData({
        userList: res.data
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  navigateTo:function(event) {

  },

  ///////
  //tabbar切换
  onChange(event) {
    wx.showToast({
      title: `点击标签 ${event.detail}`,
      icon: 'none',
    });

    if (event.detail == 'task') {
      wx.switchTab("pages/task/task");
    } else if (event.detail == 'guess') {
      wx.switchTab("pages/guess/guess");
    } else if (event.detail == 'ranking') {
      wx.switchTab('pages/ranking/ranking');
    } else if (event.detail == 'personal') {
      // wx.switchTab("pages/tabbar/personal/personal");
      wx.navigateTo({
        url: "../tabbar/personal/personal",
      })
    }
    this.setData({ active: event.detail });
  },

  //获取用户的信息
  getUserInfo:function(result) {
    console.log(result.detail.userInfo);
    userInfo.add({
      data: result.detail.userInfo
    }).then( res => {
      console.log(res);
    }).catch(err => {
      console.error(err)
    })
  }
})