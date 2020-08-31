// miniprogram/pages/taskDetail/taskDetail.js
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

  afterRead(event) {
    console.log(event.detail);
    // this.setData({ fileList });
    // const { file } = event.detail;
    // // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    // wx.uploadFile({
    //   url: 'https://example.weixin.qq.com/upload', // 仅为示例，非真实的接口地址
    //   filePath: file.path,
    //   name: 'file',
    //   formData: { user: 'test' },
    //   success(res) {
    //     // 上传完成需要更新 fileList
    //     const { fileList = [] } = this.data;
    //     fileList.push({ ...file, url: res.data });
    //     this.setData({ fileList });
    //   },
    // });
  },

  chooseImage: function(event) {
    console.log('0')
    console.log(event);
    wx.chooseImage({
      count: 9,
      mediaType: ['image','video'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
    }).then(res => {
      console.log('1')
      console.log(event);
      console.log(res)
      console.log(res.tempFiles.tempFilePath)
      console.log(res.tempFiles.size)
      // this.setData({
      //   taskPlanUploadFileList: event.
      // });
    }).catch(err => {
      console.log('2')
      console.log(event);
      console.log(err)
    })
    // var that = this;
    //     wx.chooseImage({
    //         sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    //         sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    //         success: function (res) {
    //             // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
    //             that.setData({
    //                 files: that.data.files.concat(res.tempFilePaths)
    //             });
    //         }
    //     })
  }
})