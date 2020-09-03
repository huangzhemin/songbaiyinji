const util = require("../../../util");

// components/doingTaskList/doingTaskList.js
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
      this.refreshDoingTaskList();
    },
    hide: function () { },
    resize: function () { },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    updateTaskWithOpenIdAndTaskId: function(openId, taskId, taskElement) {
      let replaceIndex = -1;
      var taskList = this.data.taskList;
      for (let index = 0; index < taskList.length; index++) {
        const element = taskList[index];
        if (element.openId == openId && element.taskId == taskId) {
          replaceIndex = index;
          break;
        }
      }
      if (replaceIndex != -1) {
        taskList[replaceIndex] = taskElement;
      } else {
        taskList.push(taskElement);
      }
      this.setData({
        taskList: taskList,
      });
    },
      
    refreshDoingTaskList: function(event) {
      var that = this;
      util.getCurrentUserTaskList({
        success: function(taskInfoRes) {
          for (const key in taskInfoRes.data) {
            if (taskInfoRes.data.hasOwnProperty(key)) {
              const element = taskInfoRes.data[key];
              if (element.status == 0) {
                that.updateTaskWithOpenIdAndTaskId(element.openId, element.taskId, util.convertDatabaseTaskToInnerTask(element));  
              }
            }
          }
        },
      });
    }
  }
})
