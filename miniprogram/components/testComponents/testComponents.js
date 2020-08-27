// components/testComponents/testComponents.js
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
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange: function (event) {
      wx.showToast({
        title: `点击标签 ${event.detail}`,
        icon: 'none',
      });

      if (event.detail == 'task') {
        console.log('task');
        wx.switchTab({
          url: "/pages/tabbar/task/task",
          complete: (res) => {console.log(res)},
          fail: (res) => {console.log(res)},
          success: (res) => {console.log(res)},
        })
      } else if (event.detail == 'guess') {
        console.log('guess');
        wx.switchTab({
          url: "/pages/tabbar/guess/guess",
          complete: (res) => {console.log(res)},
          fail: (res) => {console.log(res)},
          success: (res) => {console.log(res)},
        })
      } else if (event.detail == 'ranking') {
        console.log('ranking');
        wx.switchTab({
          url: "/pages/tabbar/ranking/ranking",
          complete: (res) => {console.log(res)},
          fail: (res) => {console.log(res)},
          success: (res) => {console.log(res)},
        })
      } else if (event.detail == 'personal') {
        console.log('personal');
        wx.switchTab({
          url: "/pages/tabbar/personal/personal",
          complete: (res) => {console.log(res)},
          fail: (res) => {console.log(res)},
          success: (res) => {console.log(res)},
        })
      }
      this.setData({ active: event.detail });
    },

    // 自定义tab切换方法增加回调
    switchTab: function (url, callback) {
      if (callback) {
        callback();
      }
      // 调用微信的switchTab切换tabbar
      wx.switchTab({url});
    }
  }
})
