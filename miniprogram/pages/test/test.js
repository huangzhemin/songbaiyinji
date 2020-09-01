// miniprogram/pages/test/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('1');
    this.getPromise().then(res => {
      console.log('2');
    });
    console.log('3');
  },

  getPromise: function () {
    return new Promise((resolve, reject) => {
      // TODO  
      // 处理结果
      if (true) {
        resolve()
      } 
      else {
        reject()
      }
    })
  }
})