// components/rankingCell/rankingCell.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    ranking: {
      type: String,
      value: '0',
    },
    avatar: {
      type: String,
      value: 'user-circle-o',
    },
    nickName: {
      type: String,
      value: '昵称'
    },
    points: {
      type: String,
      value: '0',
    },
    jumpUrl: {
      type: String,
      value: '/pages/userDetail/userDetail',
    }
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

  }
})
