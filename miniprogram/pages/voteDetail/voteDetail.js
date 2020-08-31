// miniprogram/pages/voteDetail/voteDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskTitle: "",
    taskPlan: {
      taskDesc: "就爱上了咖啡骄傲戴老师开发老大时空裂缝家傲的世间法开始发酵",
      uploadMediaList: [],
      showUpload: true,
    },
    taskComplete: {
      taskDesc: "1克里斯丁监控了对方水晶开发当时房价第三个会撒娇可感受到科技公司看反馈",
      uploadMediaList: [],
      showUpload: true,
    },

    showShare: false,
    options: [
      [
        { name: '微信', icon: 'wechat' },
        { name: '微博', icon: 'weibo' },
        { name: 'QQ', icon: 'qq' },
      ],
      [
        { name: '复制链接', icon: 'link' },
        { name: '分享海报', icon: 'poster' },
        { name: '二维码', icon: 'qrcode' },
      ],
    ],
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