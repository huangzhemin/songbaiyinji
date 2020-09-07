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
    getIndexOfTaskWithOpenIdAndTaskId: function(openId, taskId, taskElement) {
      let searchIndex = -1;
      var taskList = this.data.taskList;
      for (let index = 0; index < taskList.length; index++) {
        const element = taskList[index];
        if (element.openId == openId && element.taskId == taskId) {
          searchIndex = index;
          break;
        }
      }
      return searchIndex;
    },

    updateTaskWithOpenIdAndTaskId: function(openId, taskId, taskElement) {
      //更新或者添加 正在进行中的任务
      //执行原操作
      var taskList = this.data.taskList;
      let replaceIndex = this.getIndexOfTaskWithOpenIdAndTaskId(openId, taskId, taskElement);
      if (replaceIndex != -1) {
        if (taskHandler.isTaskCompleteState(taskElement)) {
          //此时已经查找到任务，如果当前任务状态 已经变为 完成状态（3 和 4），则直接从当前列表删除
          taskList.splice(replaceIndex, 1);
        } else {
          //否则替换掉
          taskList[replaceIndex] = taskElement;
        }
      } else {
        //未查找到，需要判断当前任务是否正在进行中
        if (taskHandler.isTaskDoingState(taskElement)) {
          //代表列表中没有该元素，需要直接添加（这种情况可能是首次加载，可能是刚刚创建新的任务）
          taskList.push(taskElement);  
        }
      }
      this.setData({
        taskList: taskList,
      });
      wx.hideLoading();
    },
      
    refreshDoingTaskList: function(event) {
      wx.showLoading({
        title: '刷新中...',
      })
      var that = this;
      util.getCurrentUserTaskList({
        success: function(taskInfoRes) {
          // that.setData({
          //   taskList: taskInfoRes.data,
          // });
          // that.triggerEvent('updateDoingTaskPageHeightEvent', {'abc': 'abc'});
          // wx.hideLoading();
          for (const key in taskInfoRes.data) {
            if (taskInfoRes.data.hasOwnProperty(key)) {
              const element = taskInfoRes.data[key];
              that.updateTaskWithOpenIdAndTaskId(element.openId, element.taskId, util.convertDatabaseTaskToInnerTask(element));  
            }
          }
        },
      });
    }
  }
})
