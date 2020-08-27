// miniprogram/pages/tabbar/guess/guess.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,

    guessList: [1],
    voteList: [1,2],
    announcement: [1,2,3],

    background: [
      {"page": "doingTask/doingTask"},
      {"page": "overTask/overTask"},
      {"page": "overTask/overTask1"}
    ],
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500
  },
  
  clickChange(event) {
    // console.log(event);
    // console.log(this.data.active)
    this.setData({ active: event.detail.index });
    // console.log(this.data.active)
  },

  swipeChange(event) {
    console.log(event)
    // console.log(this.data.active)
    this.setData({ active: event.detail.current });
    // console.log(this.data.active)

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
    console.log("guess page");
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
          active: 1
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