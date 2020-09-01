// components/userRankingList/userRankingList.js
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
    rankingList:[
      {
        avatar: 'user-circle-o',
        nickName: '小黄',
        points: '100',
        jumpUrl: '/pages/userDetail/userDetail',
      },
      {
        avatar: 'user-circle-o',
        nickName: '小白',
        points: '99',
        jumpUrl: '/pages/userDetail/userDetail',
      },
      {
        avatar: 'user-circle-o',
        nickName: '小蓝',
        points: '98',
        jumpUrl: '/pages/userDetail/userDetail',
      },
    ],
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
