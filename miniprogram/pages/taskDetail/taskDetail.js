// miniprogram/pages/taskDetail/taskDetail.js
const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
var util = require('../../util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskId: "",
    status: 0,  //warning 此处不确定状态，需要读取 0、3、4三种状态

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
    //获取传入参数
    const eventChannel = this.getOpenerEventChannel()
    var currentOpenId = '';
    var currentTaskId = '';
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', function(data) {
      currentOpenId = data.openId;
      currentTaskId = data.taskId;
    })

    wx.showLoading({
      title: 'loading...',
    })
    //通过传入的openId和taskId，拉取用户数据
    taskInfo.where({
      openId: currentOpenId,
      taskId: currentTaskId,
    }).get().then(res => {
      this.data.taskMediaList = res.data[0]['taskMediaList'];
      let uploadMediaListDic = util.getUploadMediaList(this.data.taskMediaList);
      this.setData({
        taskTitle: res.data[0]['taskTitle'],
        status: res.data[0]['status'],
        ['taskPlan.taskDesc']: res.data[0]['taskPlanDesc'],
        ['taskPlan.uploadMediaList']: uploadMediaListDic['taskPlan'],
        ['taskComplete.taskDesc']: res.data[0]['taskCompleteDesc'],
        ['taskComplete.uploadMediaList']: uploadMediaListDic['taskComplete'],
      });
    }).then(res1 => {
      wx.hideLoading();
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log(res)
    if (res.from === 'sharePannel') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.taskTitle,
      path: '/page/taskDetail/taskDetail'
    }
  },

  onShareBtnClick: function(event) {
    this.setData({ showShare: true });
  },

  onSharePannelClose: function(event) {
    this.setData({ showShare: false });
  },

  onSharePannelSelect: function(event) {
    let res = {from: "sharePannel", target:event.detail["icon"]};
    this.onShareAppMessage(res);
    this.onSharePannelClose();
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