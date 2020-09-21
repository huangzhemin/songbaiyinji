// components/taskComponents/personalTaskList/personalTaskList.js
const util = require("../../../util");
const taskHandler = require("../../../taskHandler");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    swiperHeight: {
      type: Number,
      value: 0,
    },
    needLogin: {
      type: Boolean,
      value: false,
    },
    taskStatusType: {
      type: String,
      value: '',
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    taskList: [],
    dataNeedLogin: false,
    loadMore: true,
    lock: false,
  },

  observers: {    
    'needLogin': function (needLogin) {
      this.data.dataNeedLogin = needLogin;
      if (needLogin) {
        this.showLoginView();
      } else {
        this.loadNextPage();
      }
    }
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { 
      console.log('personalTaskList show');
      if (!this.data.dataNeedLogin) {
        console.log('personalTaskList show need not login');
        this.loadNextPage();
      } else {
        console.log('personalTaskList show need login');
      }
    },
    hide: function () { },
    resize: function () { },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    loadMoreData: function(event) {
      console.log('personalTaskList loadMoreData', event);
      this.loadNextPage();
    },

    showLoginView: function(event) {
      this.setData({
        dataNeedLogin: this.data.dataNeedLogin,
      });
      wx.hideLoading();
    },

    userLoginAndGetUserInfo:function(event) {
      let that = this;
      //通过用户信息，刷新页面
      util.userLoginAndGetUserInfo({
        userInfo: event.detail.userInfo,
        success: function(currentOpenId, latestUserInfo) {
          console.log('currentOpenId, latestUserInfo', currentOpenId, latestUserInfo);
          //通过返回的当前用户openId，直接更新登录状态和刷新页面
          if (util.validStr(currentOpenId)) {
            that.data.dataNeedLogin = false;
            that.loadNextPage();
          }
        }
      });
    },

    loadNextPage: function() {
      if (!this.data.loadMore) {
        console.log('loadNextPage cannot loadMore', this.data);
        return;
      }
      if (this.data.lock) {
        return;
      }
      this.data.lock = true;

      console.log('loadNextPage invoked');

      wx.showLoading({
        title: '刷新中...',
      })
      let that = this;
      let taskNumOnePage = 10;
      util.getUserDetailNextPageTaskListWithCurrentStatus({
        currentUserDetailTaskList: that.data.taskList,
        taskListType: that.properties.taskStatusType,
        taskNumOnePage: taskNumOnePage,
        success: function(taskInfoRes) {
          console.log('taskInfoRes', taskInfoRes);
          let newUserTaskList = util.batchConvertDatabaseTaskToInnerTask(taskInfoRes);
          that.data.loadMore = newUserTaskList.length == taskNumOnePage;
          that.data.taskList = that.data.taskList.concat(newUserTaskList);
          that.setData({
            taskList: that.data.taskList,
            loadMore: that.data.loadMore,
            dataNeedLogin: that.data.dataNeedLogin,
          });
          wx.hideLoading();
          that.data.lock = false;
        },
        fail: function(err) {
          wx.hideLoading();
          that.data.lock = false;
          console.log('err', err);
        },
      });
    },
  }
})
