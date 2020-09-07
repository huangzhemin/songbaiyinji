const util = require("../../../util");
const taskHandler = require("../../../taskHandler");

// components/doingTaskList/doingTaskList.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    swiperHeight: {
      type:Number,
      value: 0,
    }
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
      this.refreshDoingTaskList();
    },
    hide: function () { },
    resize: function () { },
  },

  /**
   * 组件的方法列表
   */
  methods: {      
    refreshDoingTaskList: function(event) {
      wx.showLoading({
        title: '刷新中...',
      })
      var that = this;
      //这里直接从云数据库层面筛掉 status == 3 和 status == 4的数据， 剩下的就是正在进行中的任务，逆向排序
      util.getCurrentUserTaskListWithStatusType({
        type: 'doing',
        success: function(taskInfoRes) {
          that.setData({
            taskList: taskInfoRes.data,
          });
          wx.hideLoading();
        }
      });
    }
  }
})
