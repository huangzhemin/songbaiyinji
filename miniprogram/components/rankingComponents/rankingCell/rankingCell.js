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
    openId: {
      type: String,
      value: '',
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
      type: Number,
      value: 0,
    },
    jumpUrl: {
      type: String,
      value: '/pages/userDetail/userDetail',
    },
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
    navigateTo: function(event) {
      wx.navigateTo({
        url: this.properties.jumpUrl,
      }).then(res => {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { 
          'openId': this.properties.openId,   //类似'oBG1A5f75CT8Bj1gAG4OMkXgDyXM',
          'userRanking': this.properties.ranking, //排名
        });
      });
    }
  }
})
