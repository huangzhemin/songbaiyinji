// components/taskComponents/findTaskList/findTaskList.js
const util = require("../../../util");
const { validList } = require("../../../util");

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
    lock: false,
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
      this.data.loadMore = true;
      this.data.lock = false;
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
      //此处需要加一个简单变量作为锁变量，用来控制是否可以拉取下一屏
      //只有当 一屏数据回来之后，锁变量才可以再次打开，保证不重新加载当前页
      if (this.data.lock) {
        return;
      }
      this.data.lock = true;

      //如果已经加载完全部的列表，则直接返回
      if (!this.data.loadMore) {
        return;
      }

      //如果是空列表第一次加载，则展示loading动画
      var isFirstLoad = false;
      if (!validList(this.data.taskList)) {
        //数据为空的时候，是第一次加载
        isFirstLoad = true;
        wx.showLoading({
          title: '加载中..',
        })
      }

      //准备拉取「发现页」下一页的任务数据
      let that = this;
      let taskNumOnePage = 10;
      util.getNextPageTaskListWithCurrentStatus({
        type: 'doing',
        currentTaskList: that.data.taskList,
        taskNumOnePage: taskNumOnePage,
        success: function(newPageTaskOriginList) {
          console.log('findTaskList before', that.data.taskList)
          let newPageTaskList = util.batchConvertDatabaseTaskToInnerTask(newPageTaskOriginList);
          that.data.taskList = that.data.taskList.concat(newPageTaskList);
          that.data.loadMore = newPageTaskList.length == taskNumOnePage;

          console.log('findTaskList after', that.data.taskList)
          that.setData({
            taskList: that.data.taskList,
            loadMore: that.data.loadMore,
          });
          if (isFirstLoad) {
            //第一次加载时，需要hide掉loading动画
            wx.hideLoading();
          }
          that.data.lock = false;
        },
        fail: function(err) {
          that.data.lock = false;
        }
      });
    }
  }
})
