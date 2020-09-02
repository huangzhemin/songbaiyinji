// components/personalComponents/personalProfileCell/personalProfileCell.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
var config = require('../../../config.js')

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
    currentLoginUserData: {},
  },

  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      // console.log("personalProfile attached");
      // userInfo.doc('_openid').get({
      //   }).then(res => {
      //     this.setData({
      //       currentLoginUserData: res.data,
      //     })
      //   }).catch(err => {
      //     console.error(err)
      //   })
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
      // console.log("personalProfile detached");
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClick(event) {
      // this.logout();
      // return;
      wx:wx.getSetting({
        withSubscriptions: true,
        success: (result) => {
          //此处需要判断是否已经获取到用户登录权限
          if (!result.authSetting['scope.userInfo']) {
            //此时未授权，需要询问用户获取授权
            wx.authorize({
              scope: 'scope.userInfo',
            }).then(res => {
              //此时成功授权
              console.log('');
              this.getUserAuth();
            }).catch(err => {
              //授权失败
              console.error(err);
              //此处没有必要跳转到授权页，直接弹出弹窗即可
              wx.showToast({
                title: '需要登录才可查看',
                icon: 'fail',
                duration: 2000
              })
            })
          } else {
            //此时已授权，则直接跳转用户个人信息底层页，1.0版本先禁掉跳转
            // wx.navigateTo({
            //   url: '/pages/userDetail/userDetail',
            // })
            console.log('user has login');
            this.getUserAuth();
          }
        }
      })
    },

    logout: function() {
      wx.clearStorage();
      wx.clearStorageSync();
    },

    getUserAuth: function() {
      wx.showLoading({
        title: '加载中',
      })
      wx.getUserInfo({
      }).then(userInfoRes => {
        //获取用户信息成功
        console.log(userInfoRes.userInfo['_openid']);
        //此处需要写入用户数据
        // userInfo.doc('_openid').update({
        //   data: res.userInfo
        // }).then( res => {
        //   console.log(res);
        // }).catch(err => {
        //   console.error(err)
        // })
        if (userInfoRes.encryptedData && userInfoRes.iv) {
          wx.login({
          }).then(loginRes => {
            //将用户基本信息回传给服务器，并获取access_token
            console.log(loginRes);
            // if (loginRes.code) {
            //   wx.request({
            //     url: 'https://test.com/onLogin',
            //     data: {
            //       code: loginRes.code
            //     }
            //   })
            // } else {
            //   console.log('登录失败！' + loginRes.errMsg)
            // }
            //   console.log(config.getBaseUrl);
            //   wx.request({
            //     url: config.getBaseUrl + '/auth/api/token',
            //     method: 'POST',
            //     data: {
            //         code: res.code,
            //         encryptedData: this.globalData.encryptedData,
            //         iv: this.globalData.iv
            //     },
            //     header: {
            //       'accept': 'application/json'
            //     },
            //   }).then(res => {
            //     //输出access_token
            //     let authorizationValue = res.data.access_token;
            //     console.log(authorizationValue);
            //     if (authorizationValue) {
            //       wx.hideLoading();
            //     }
            //   })
            // } else {
            //   console.log("123");
            // }
          })
        }
      })
    }
  }
})
