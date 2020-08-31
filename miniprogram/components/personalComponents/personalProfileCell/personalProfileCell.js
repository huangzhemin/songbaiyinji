// components/personalComponents/personalProfileCell/personalProfileCell.js
const db = wx.cloud.database()
const currentLoginUserInfo = db.collection('currentLoginUserInfo')
const userInfo = db.collection('userInfo')

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
    currentLoginUserData: {},
    defaultAvatar: 'https://b.yzcdn.cn/vant/icon-demo-1126.png',
  },

  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      console.log("personalProfile attached");
      currentLoginUserInfo.doc('currentSDKUserInfo').get({
        }).then( res => {
          this.setData({
            currentLoginUserData: res.data,
          })
        }).catch(err => {
          console.error(err)
        })
    },
    detached: function() {
      // 在组件实例被从页面节点树移除时执行
      // console.log("personalProfile detached");
    },
  },

  pageLifetimes: {
    show: function() {
      // 页面被展示
      console.log("page show");
    },
    hide: function() {
      // 页面被隐藏
      console.log("page hide");
    },
    resize: function(size) {
      // 页面尺寸变化
      console.log("page resize");
    }
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
          if (result.authSetting['scope.userInfo']) {
            //此时已授权，则直接跳转用户个人信息底层页
            wx.navigateTo({
              url: '/pages/userDetail/userDetail',
            })
          } else {
            //此时未授权，需要询问用户获取授权
            wx.authorize({
              scope: 'scope.userInfo',
            }).then(res => {
              //此时成功授权
              this.getUserAuth();
            }).catch(err => {
              //授权失败
              console.error(err);;
              //此处没有必要跳转到授权页，直接弹出弹窗即可
              wx.showToast({
                title: '需要登录才可查看',
                icon: 'fail',
                duration: 2000
              })
            })
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
      }).then(res => {
        //获取用户信息成功
        console.log(res.userInfo);
        //此处需要写入用户数据
        // currentLoginUserInfo.doc('currentSDKUserInfo').set({
        //   data: res.userInfo
        // }).then( res => {
        //   console.log(res);
        // }).catch(err => {
        //   console.error(err)
        // })
        // if (res.encryptedData && res.iv) {
        //   wx.login({
        //   }).then(res => {
        //     //将用户基本信息回传给服务器，并获取access_token
        //     if (res.code) {
        //       console.log(config.getBaseUrl);
        //       wx.request({
        //         url: config.getBaseUrl + '/auth/api/token',
        //         method: 'POST',
        //         data: {
        //             code: res.code,
        //             encryptedData: this.globalData.encryptedData,
        //             iv: this.globalData.iv
        //         },
        //         header: {
        //           'accept': 'application/json'
        //         },
        //       }).then(res => {
        //         //输出access_token
        //         let authorizationValue = res.data.access_token;
        //         console.log(authorizationValue);
        //         if (authorizationValue) {
        //           wx.hideLoading();
        //         }
        //       })
        //     } else {
        //       console.log("123");
        //     }
        //   })
        // }
      })
    }
  }
})
