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

  behaviors: ['wx://component-export'],  
  export() {
      return {findTaskList: this} 
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { 
      //当页面展示的时候
      console.log('doingTaskList show');
      this.loadNextPage();
    },
    hide: function () { },
    resize: function () { },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    refreshTaskList: function(event) {
      console.log('refreshTaskList', this.data.taskList)
      this.data.taskList = [];
      wx.showLoading({
        title: '刷新中...',
      })
      var that = this;
      util.getTaskListWithStatusType({
        type: 'doing',
        success: function(taskInfoRes) {
          that.setData({
            taskList: util.batchConvertDatabaseTaskToInnerTask(taskInfoRes.data),
          });
          wx.hideLoading();
        },
      });
    },

    loadNextPage: function(event) {
      console.log('loadNextPage', this.data.taskList)
      var that = this;
      util.getNextPageTaskListWithStatusType({
        type: 'doing',
        currentTaskList: that.data.taskList,
        taskNumOnePage: 5,
        success: function(taskInfoRes) {
          console.log('that.data.taskList before', that.data.taskList)
          let newTaskList = that.data.taskList.concat(util.batchConvertDatabaseTaskToInnerTask(taskInfoRes.data));
          console.log('that.data.taskList after', newTaskList)
          that.setData({
            taskList: newTaskList,
          });
        },
      });
    }
  }
})
