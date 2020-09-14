// components/taskComponents/findTaskList/findTaskList.js
const util = require("../../../util");

Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    taskList: [],
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { 
      //当页面展示的时候
      console.log('doingTaskList show');
      this.refreshTaskList();
    },
    hide: function () { },
    resize: function () { },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    refreshTaskList: function(event) {
      this.data.taskList = [];
      wx.showLoading({
        title: '刷新中...',
      })
      var that = this;
      util.getNextPageTaskListWithStatusType({
        type: 'doing',
        currentTaskList: that.data.taskList,
        taskNumOnePage: 5,
        success: function(taskInfoRes) {
          that.setData({
            taskList: that.data.taskList.concat(util.batchConvertDatabaseTaskToInnerTask(taskInfoRes.data)),
          });
          wx.hideLoading();
        },
      });
    }
  }
})
