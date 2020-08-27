// miniprogram/pages/tabbar/task/task.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 1,

    background: [
      { "img": "https://images.unsplash.com/photo-1551334787-21e6bd3ab135?w=640"},
      { "img": "https://images.unsplash.com/photo-1551334787-21e6bd3ab135?w=640"}
    ],
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500
  },
  
  onChange(event) {
    console.log(event.detail.index);
    if (event.detail.index == '0') {
      wx.navigateTo({
        url: 'doingTask/doingTask',
      })
    } else {
      wx.navigateTo({
        url: 'overTask/overTask',
      })
    }
    // wx.showToast({
    //   title: `切换到标签 ${event.detail}`,
    //   icon: 'none',
    // });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    console.log(this.getTabBar());
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({
            active: 0
        });
    }
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

  }
})