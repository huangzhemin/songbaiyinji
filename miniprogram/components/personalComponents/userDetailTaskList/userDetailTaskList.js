// components/personalComponents/userDetailTaskList/userDetailTaskList.js
const util = require('../../../util.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    propertyOpenId: {
      type: String,
      value: '',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    taskList: [],
    loadMore: true,
    lock: false,
  },

  behaviors: ['wx://component-export'],  
  export() {
      return {userDetailTaskList: this} 
  },

  /**
   * 组件的方法列表
   */
  methods: {
    loadNextPage: function(openId) {
      console.log('loadNextPage');
      if (!util.validStr(openId)) {
        console.log('invalid userDetail openId');
        return;
      }

      if (this.data.lock) {
        return;
      }
      this.data.lock = true;

      wx.showLoading({
        title: '加载中...',
      })
      let that = this;
      let taskNumOnePage = 10;
      util.getUserDetailNextPageTaskListWithCurrentStatus({
        openId: openId,
        currentUserDetailTaskList: that.data.taskList,
        taskNumOnePage: taskNumOnePage,
        success: function(taskInfoRes) {
          console.log('loadNextPage', taskInfoRes);
          let newUserTaskList = util.batchConvertDatabaseTaskToInnerTask(taskInfoRes);
          that.data.loadMore = newUserTaskList.length == taskNumOnePage;
          that.data.taskList = that.data.taskList.concat(newUserTaskList);
          that.setData({
            //用户任务列表数据
            taskList: that.data.taskList,
            loadMore: that.data.loadMore,
          })
          that.data.lock = false;
          wx.hideLoading();
        },
        fail: function(err) {
          that.data.lock = false;
          wx.hideLoading();
        }
      });
    }
  }
})
