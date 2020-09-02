// miniprogram/pages/voteDetail/voteDetail.js
const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
var util = require('../../util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskId: "",
    status: 2,  //投票状态

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
    wx.showLoading({
      title: 'loading...',
    })
    taskInfo.doc('f241f5fe5f4f67ab0011a3e826d8a99d').get().then(res => {
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
  onShareAppMessage: function (res) {
    console.log(res)
    if (res.from === 'sharePannel') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.taskTitle,
      path: '/page/voteDetail/voteDetail'
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
})