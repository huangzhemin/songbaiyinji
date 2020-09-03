// components/overTaskList/overTaskList.js
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
    taskList: []
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { 
      //当页面展示的时候
      console.log('overTaskList show');
      this.refreshCompleteTaskList();
    },
    hide: function () { },
    resize: function () { },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    refreshCompleteTaskList: function(event) {
      var that = this;
      var taskList = [];
      util.getCurrentUserTaskList({
        success: function(taskInfoRes) {
          for (const key in taskInfoRes.data) {
            if (taskInfoRes.data.hasOwnProperty(key)) {
              const element = taskInfoRes.data[key];
              if (element.status == 3 || element.status == 4) {
                taskList.push(util.convertDatabaseTaskToInnerTask(element));
                wx.hideLoading();
              }
            }
          }

          that.setData({
            taskList: taskList,
          });
        },
      });
    }
  }
})
