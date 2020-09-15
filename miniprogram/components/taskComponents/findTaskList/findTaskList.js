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
    loadMore: true,
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
      //warning 先调整为，每次onShow，清空后重新拉取，保证能展示最新数据，后续改为下拉刷新
      this.data.taskList = [];
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
      let that = this;
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
      //如果已经加载完全部的列表，则直接返回
      if (!this.data.loadMore) {
        return;
      }

      //准备拉取「发现页」下一页的任务数据
      let that = this;
      let taskNumOnePage = 5;
      util.getNextPageTaskListWithCurrentStatus({
        type: 'doing',
        currentTaskList: that.data.taskList,
        taskNumOnePage: taskNumOnePage,
        success: function(newPageTaskOriginList) {
          console.log('findTaskList before', that.data.taskList)
          let newPageTaskList = util.batchConvertDatabaseTaskToInnerTask(newPageTaskOriginList);
          let newTaskList = that.data.taskList.concat(newPageTaskList);
          console.log('findTaskList after', newTaskList)
          that.setData({
            taskList: newTaskList,
            loadMore: newPageTaskList.length == taskNumOnePage,
          });
        },
      });
    }
  }
})
