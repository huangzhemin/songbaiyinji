const util = require("../../../util");

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
    },
    needLogin: false,
  },

  onLoad: function(event) {
    console.log('taskTab onLoad');
    this.updateDoingTaskPageHeight();
  },

  onShow: function(event) {
    console.log('taskTab onShow');
    this.p_setSwipterHeight(this.data.swiper.swiperHeight);
  },

  clickChange(event) {
    console.log('clickChange', event);
    // console.log(this.data.active)
    let that = this;
    util.isLogin({
      success: function(logined) {
        that.setData({ 
          ['swiper.active']: event.detail.index,
          needLogin: !logined,
        });
      }
    });
    // console.log(this.data.active)
  },

  swipeChange(event) {
    console.log('swipeChange', event);
    // console.log(this.data.active
    let that = this;
    util.isLogin({
      success: function(logined) {
        that.setData({ 
          ['swiper.active']: event.detail.current,
          needLogin: !logined,
        });
      }
    });
    // console.log(this.data.active)
  },

  p_setSwipterHeight: function(swiperHeight) {
    //拿到页面尺寸之后，需要判断当前用户是否处于登录的状态
    let that = this;
    util.isLogin({
      success: function(logined) {
        console.log('logined', logined);
        that.setData({
          ['swiper.swiperHeight']: swiperHeight,
          needLogin: !logined, //未登录状态，需要展示登录头像UI，已登录，则直接展示个人任务页面
        });
      }
    })
  },

  updateDoingTaskPageHeight: function(event) {
    console.log(event);
    let that = this;
    //无论是否需要登录，都要计算页面尺寸
    console.log('event', event);
    wx.getSystemInfo({
      success (res) {
        wx.createSelectorQuery()
          .select('#start-doing-task-list').boundingClientRect().exec(rect => {
            console.log('getSystemInfo', rect);
            that.p_setSwipterHeight(res.windowHeight - rect[0].bottom);
        })
      }
    });
  }
})