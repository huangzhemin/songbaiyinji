// miniprogram/pages/tabbar/task/task.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiper: {
      active: 0,

      swiperHeight: 0,

      indicatorDots: false,
      vertical: false,
      autoplay: false,
      interval: 2000,
      duration: 500,
    }
  },

  onLoad: function(event) {
    this.updateDoingTaskPageHeight();
  },

  clickChange(event) {
    // console.log(event);
    // console.log(this.data.active)
    this.setData({ ['swiper.active']: event.detail.index });
    // console.log(this.data.active)
  },

  swipeChange(event) {
    // console.log(event)
    // console.log(this.data.active)
    this.setData({ ['swiper.active']: event.detail.current });
    // console.log(this.data.active)
  },

  updateDoingTaskPageHeight: function(event) {
    console.log(event);
    let that = this;
    wx.getSystemInfo({
      success (res) {
        wx.createSelectorQuery()
          .select('#start-doing-task-list').boundingClientRect().exec(rect => {
          that.setData({
            ['swiper.swiperHeight']: res.windowHeight - rect[0].bottom,
          });
        })
      }
    });
  }
})