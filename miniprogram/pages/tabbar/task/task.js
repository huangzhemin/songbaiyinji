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
  //   wx.createSelectorQuery()
  //     .select('#end-doing-task-list').boundingClientRect()
  //     .select('#start-doing-task-list').boundingClientRect().exec(rect => {
  //     console.log('test end rect top:'+rect[0].top);
  //     console.log('test start rect top:'+rect[1].top);
  //     let _space = (rect[0].top - rect[1].top).toString + 'px';
  //     this.setData({
  //       ['swiper.swiperHeight']: _space,
  //     });
  //   })
  }
})