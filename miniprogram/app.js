//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'patrikhuang-32ayj',
        traceUser: true,
      })
    }

    this.getUserSetting();

    this.globalData = {}
  },

  getUserSetting: function(event) {
    wx.getSetting({
      withSubscriptions: true,
      success: (result) => {
        //此处需要判断是否已经获取到用户登录权限
        if (!result.authSetting['scope.userInfo']) {
          //此时未授权，需要询问用户获取授权
          wx.authorize({
            scope: 'scope.userInfo',
          }).then(res => {
            //此时成功授权
            console.log('authorize success');
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
          this.writeLocalStorage();
        }
      }
    })
  },

  getUserAuth: function() {
    wx.showLoading({
      title: '加载中',
    })
    
    wx.getUserInfo().then(userInfoRes => {
      //获取用户信息成功
      console.log(userInfoRes.userInfo);
      //在写入之前需要先查询用户数据，是否存在
      //此处需要写入用户数据
      
      userInfo.add({
        data: userInfoRes.userInfo
      }).then( userInfoDatabaseRes => {
        console.log(userInfoDatabaseRes);
      }).catch(err => {
        console.error(err)
      })
    })
  },

  writeLocalStorage: function(event) {
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: "login",
    }).then(loginRes =>{
      wx.setStorage({
        key:'openid',
        data:loginRes['result']['openid'],          
      })
    });
  }
})
