// miniprogram/pages/createTask/createTask.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskPlan: {
      uploadMediaList: [],
      showUpload: true,
    },
    taskComplete: {
      uploadMediaList: [],
      showUpload: true,
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

  },
  
  chooseImage: function (event) {
    let chooseTaskUploadBtnId = event.currentTarget["id"];
    let currentTaskUpload = this.data.taskPlan;
    if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
      currentTaskUpload = this.data.taskPlan;
    } else if (chooseTaskUploadBtnId == 'taskCompleteUploadClick') {
      currentTaskUpload = this.data.taskComplete;
    }
    wx.chooseImage({
      count: 9 - currentTaskUpload.uploadMediaList.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    }).then(res => {
      // tempFilePath可以作为img标签的src属性显示图片
      if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
        this.setData({
          taskPlan: {
            uploadMediaList: currentTaskUpload.uploadMediaList.concat(res.tempFilePaths),
            showUpload: (currentTaskUpload.uploadMediaList.length + res.tempFilePaths.length < 9) ? true : false,
          }
        });
      }  else if (chooseTaskUploadBtnId == 'taskCompleteUploadClick') {
        this.setData({
          taskComplete: {
            uploadMediaList: currentTaskUpload.uploadMediaList.concat(res.tempFilePaths),
            showUpload: (currentTaskUpload.uploadMediaList.length + res.tempFilePaths.length < 9) ? true : false,
          }
        });
      }
    })
  },

  previewImage: function (event) {
    console.log(event.currentTarget);
    wx.previewImage({
      // current: '', // 当前显示图片的http链接
      urls: this.data.taskPlanUploadMediaList // 需要预览的图片http链接列表
    })
  }
})