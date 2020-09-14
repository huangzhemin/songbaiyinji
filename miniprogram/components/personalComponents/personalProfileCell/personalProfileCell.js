// components/personalComponents/personalProfileCell/personalProfileCell.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
var config = require('../../../config.js')
const util = require('../../../util.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    avatarUrl: {
      type: String,
      value: 'https://b.yzcdn.cn/vant/icon-demo-1126.png',
    },
    nickName: {
      type: String,
      value: '',
    },
    userRanking: {
      type: String,
      value: '',
    },
    userPoints: {
      type: String,
      value: '0',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    avatarUrl: '',
    nickName: '',
    userRanking: '',
    userPoints: '',

    currentOpenId: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    userLoginAndGetUserInfo:function(event) {
      let that = this;
      //通过用户信息，刷新页面
      util.userLoginAndGetUserInfo({
        userInfo: event.detail.userInfo,
        success: function(currentOpenId, latestUserInfo) {
          console.log('personalProfileCell getUserInfo', currentOpenId, latestUserInfo);
          //这里不再刷新子组件，而是交由page对页面进行刷新
          that.triggerEvent('refreshPersonalPageEvent', {'openId': currentOpenId, 'userInfo': latestUserInfo});
        }
      });          
    }
  },
})
