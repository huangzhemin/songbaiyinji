// components/voteCell/voteCell.js
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
    title: '测试标题,测试标题,测试标题,测试标题',
    desc: '测试描述，这是一条很长的描述很长的描述很长的描述很长的描述',
    tag: '标签',
    status: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClick(event) {
      wx.navigateTo({
        url: '/pages/taskDetail/taskDetail',
      })
    }
  }
})
