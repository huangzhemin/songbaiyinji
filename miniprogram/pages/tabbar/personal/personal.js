// miniprogram/pages/tabbar/personal/personal.js
const util = require("../../../util")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
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

  onShow: function() {
    // Do some initialize when page load.
    let that = this;
    util.getCurrentUserInfo({
      success: function(openId, userInfoRes) {
        let currentUserInfo = userInfoRes.data[0];
        that.p_refreshPersonalPage(openId, currentUserInfo);
      },
      fail: function(err) {
        console.error(err);
        wx.showToast({
          title: '请登录',
        })
        wx.hideLoading();
      }
    })
  },

  onReachBottom: function() {
    //暂时屏蔽，列表拉取逻辑移动到component内部
    //再上拉加载
    // Do something when page reach bottom.
    console.log('personalTaskList onReachBottom');
    this.p_loadUserDetailNextPageTaskList(this.data.openId, 'onReachBottom');
  },

  refreshPersonalPage: function(event) {
    this.p_refreshPersonalPage(event.detail.openId, event.detail.userInfo);
  },

  p_refreshPersonalPage: function(openId, userInfo) {
    console.log('p_refreshPersonalPage', openId, userInfo);
    let currentUserInfo = userInfo;

    this.data.openId = openId; //更新当前用户的openId
    //刷新用户头像
    this.setData({
      //用户头像数据
      ['userInfo.sdkUserInfo.avatarUrl']: currentUserInfo['avatarUrl'],
      ['userInfo.sdkUserInfo.nickName']: currentUserInfo['nickName'],
      ['userInfo.customUserInfo.userRanking']: currentUserInfo['ranking'], 
      ['userInfo.customUserInfo.userPoints']: currentUserInfo['points'],
    });
    //用户任务列表数据
    this.p_loadUserDetailNextPageTaskList(openId, 'firstPage');
  },

  p_loadUserDetailNextPageTaskList: function(openId, loadType) {
    let _userDetailTaskList = this.selectComponent('#userDetailTaskList').userDetailTaskList;
    _userDetailTaskList.loadNextPage(openId, loadType);
  },

  // 跳转至消息页
  onMsgClick: function(event) {
    let that = this;
    wx.navigateTo({
      url: '/pages/msgDetail/msgDetail',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { 
          'openId': that.data.openId,   //类似'oBG1A5f75CT8Bj1gAG4OMkXgDyXM',
        })
      }
    });
  }
})