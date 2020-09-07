// components/overTaskList/overTaskList.js
const util = require("../../../util");
const taskHandler = require("../../../taskHandler");

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
      wx.showLoading({
        title: '刷新中...',
      })
      var that = this;
      //只筛选完成的样式
      util.getCurrentUserTaskListWithStatusType({
        type: 'complete',
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
