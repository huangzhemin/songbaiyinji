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
    let that = this;
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      that.data.openId = data.openId;
      that.data.userInfo.customUserInfo.userRanking = data.ranking;

      that.loadUserDetailInfo();
    });
  },

  onReachBottom: function() {
    //暂时屏蔽，列表拉取逻辑移动到component内部
    //再上拉加载
    // Do something when page reach bottom.
    console.log('personalTaskList onReachBottom');
    this.p_loadUserDetailNextPageTaskList(this.data.openId, 'onReachBottom');
  },

  loadUserDetailInfo: function() {
    wx.showLoading({
      title: '加载中..',
    })

    //此处根据传入的openId，对用户信息 和 用户的任务列表进行请求
    let that = this;
    util.getCurrentUserInfo({
      openId: that.data.openId,
      success: function(openId, userInfoRes) {
        that.setData({
          ['userInfo.sdkUserInfo.avatarUrl']: userInfoRes.data[0].avatarUrl,
          ['userInfo.sdkUserInfo.nickName']: userInfoRes.data[0].nickName,
          ['userInfo.customUserInfo.userRanking']: userInfoRes.data[0].ranking,
          ['userInfo.customUserInfo.userPoints']: userInfoRes.data[0].points,
        });
      }
    });
    that.p_loadUserDetailNextPageTaskList(that.data.openId, 'firstPage');
  },

  p_loadUserDetailNextPageTaskList: function(openId, loadType) {
    console.log('p_loadUserDetailNextPageTaskList invoked');
    let _userDetailTaskList = this.selectComponent('#userDetailTaskList').userDetailTaskList;
    _userDetailTaskList.loadNextPage(openId, loadType);
  },
})