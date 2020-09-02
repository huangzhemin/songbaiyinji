// miniprogram/pages/taskDetail/taskDetail.js
const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
var util = require('../../util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskTitle: "",
    taskPlan: {
      taskDesc: "",
      uploadMediaList: [],
      showUpload: true,
    },
    taskComplete: {
      taskDesc: "",
      uploadMediaList: [],
      showUpload: true,
    },
    taskMediaList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: 'loading...',
    })
    taskInfo.doc('f241f5fe5f4f67ab0011a3e826d8a99d').get().then(res => {
      console.log(res);
      this.data.taskMediaList = res.data['taskMediaList'];
      let uploadMediaListDic = util.getUploadMediaList(this.data.taskMediaList);
      this.setData({
        taskTitle: res.data['taskTitle'],
        ['taskPlan.taskDesc']: res.data['taskPlanDesc'],
        ['taskPlan.uploadMediaList']: uploadMediaListDic['taskPlan'],
        ['taskComplete.taskDesc']: res.data['taskCompleteDesc'],
        ['taskComplete.uploadMediaList']: uploadMediaListDic['taskComplete'],
      });
    }).then(res1 => {
      wx.hideLoading();
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
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
  }
})