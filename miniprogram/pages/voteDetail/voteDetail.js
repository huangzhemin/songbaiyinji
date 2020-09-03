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
      let uploadMediaListDic = util.getUploadMediaList(currentOpenId, currentTaskId, this.data.taskMediaList); 
      this.setData({
        taskTitle: res.data[0]['taskTitle'],
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