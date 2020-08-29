// components/personalComponents/personalProfileCell/personalProfileCell.js
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
    onClick(event) {
      wx.navigateTo({
        url: '/pages/userDetail/userDetail',
      })
    }
  }
})
