// miniprogram/pages/userDetail/userDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskList: [
      {
        taskTitle:'这是任务标题任务标题任务标题',
        taskDesc: '这是任务描述这是任务描述这是任务描述这是任务描述',
        status: '0',
        thumbImg: '/images/create-collection.png',
      },
      {
        taskTitle:'这是任务标题任务标题任务标题',
        taskDesc: '这是任务描述这是任务描述这是任务描述这是任务描述',
        status: '1',
        thumbImg: '/images/create-collection.png',
      },
      {
        taskTitle:'这是任务标题任务标题任务标题',
        taskDesc: '这是任务描述这是任务描述这是任务描述这是任务描述',
        status: '3',
        thumbImg: '/images/create-collection.png',
      },
    ],
    userInfo: {
      sdkUserInfo: {
        avatarUrl: 'https://b.yzcdn.cn/vant/icon-demo-1126.png',
        nickName: '小黄',
      },
      customUserInfo: {
        userRanking: '1',
        userPoints: '100',
      },
    }
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