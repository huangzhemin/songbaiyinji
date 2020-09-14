// miniprogram/pages/tabbar/find/find.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  onReachBottom: function() {
    // Do something when page reach bottom.
    let _findTaskList = this.selectComponent('#findTaskList').findTaskList;
    _findTaskList.loadNextPage();
  },
})