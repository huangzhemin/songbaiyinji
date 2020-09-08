// miniprogram/pages/userDetail/userDetail.js
const util = require('../../util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    taskList: [],
    userInfo: {
      sdkUserInfo: {
        avatarUrl: '',
        nickName: '',
      },
      customUserInfo: {
        userRanking: '',
        userPoints: '',
      },
    },
  },

  onLoad: function(event) {
    //获取传入参数
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    var that = this;
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      that.data.openId = data.openId;
      that.data.userInfo.customUserInfo.userRanking = data.userRanking;

      that.loadUserDetailInfo();
    });
  },

  loadUserDetailInfo: function() {
    wx.showLoading({
      title: '加载中..',
    })

    //此处根据传入的openId，对用户信息 和 用户的任务列表进行请求
    var promiseArr = [];
    var userInfo = {};
    var taskInfo = {};
    var that = this;

    let promiseUserInfo = new Promise((resolve, reject) => {
      util.getCurrentUserInfo({
        openId: that.data.openId,
        success: function(openId, userInfoRes) {
          userInfo = userInfoRes;
          resolve(userInfo);
        }
      })
    });
    promiseArr.push(promiseUserInfo);

    let promiseUserTaskList = new Promise((resolve, reject) => {
      util.getCurrentUserTaskList({
        openId: that.data.openId,
        success: function(taskInfoRes) {
          taskInfo = taskInfoRes;
          resolve(taskInfo);
        }
      })
    });
    promiseArr.push(promiseUserTaskList);

    Promise.all(promiseArr).then((result) => {
      promiseArr = [];
      that.setData({
        taskList: taskInfo.data,
        ['userInfo.sdkUserInfo.avatarUrl']: userInfo.data[0].avatarUrl,
        ['userInfo.sdkUserInfo.nickName']: userInfo.data[0].nickName,
        ['userInfo.customUserInfo.userRanking']: that.data.userInfo.customUserInfo.userRanking,
        ['userInfo.customUserInfo.userPoints']: userInfo.data[0].points,
      });
      wx.hideLoading();
    });
  }
})