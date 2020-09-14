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
  },

  observers: {    
    'needLogin': function (needLogin) {
      this.data.dataNeedLogin = needLogin;
      if (needLogin) {
        this.showLoginView();
      } else {
        this.refreshDoingTaskList();
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
            that.refreshDoingTaskList();
          }
        }
      });
    },

    refreshDoingTaskList: function(event) {
      console.log('refreshDoingTaskList');
      wx.showLoading({
        title: '刷新中...',
      })
      var that = this;
      //这里直接从云数据库层面筛掉 status == 3 和 status == 4的数据， 剩下的就是正在进行中的任务，逆向排序
      console.log('refreshDoingTaskList before getCurrentUserTaskListWithStatusType', event);
      var taskStatusType = '';
      console.log('this.properties.taskStatusType', this.properties.taskStatusType);
      if (this.properties.taskStatusType == 'doing'
        || this.properties.taskStatusType == 'complete') {
          taskStatusType = this.properties.taskStatusType;
      }
      if (util.validStr(taskStatusType)) {
        util.getCurrentUserTaskListWithStatusType({
          type: taskStatusType,
          success: function(taskInfoRes) {
            console.log('refreshDoingTaskList getCurrentUserTaskListWithStatusType', taskInfoRes, that.data.dataNeedLogin);
            that.setData({
              taskList: taskInfoRes.data,
              dataNeedLogin: that.data.dataNeedLogin,
            });
            wx.hideLoading();
          }
        });
      } else {
        //给开发者提示
        wx.showToast({
          title: '错误列表',
        })
      }
    }
  }
})
