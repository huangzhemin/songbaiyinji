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
  
    getUserInfo:function(event) {
      //获取用户的授权情况
      wx.getSetting({
        withSubscriptions: true,
        success: (result) => {
          wx.showLoading({
            title: '登录中..',
          })
          //此处需要判断是否已经获取到用户登录权限
          //userInfo只能在getUserInfo中输出
          if (result.authSetting['scope.userInfo']) {
            console.log('user has Authorize and login');
            this.userHasAuthorize(event.detail.userInfo);
          } else {
            console.log('user no Authorize');
            this.getUserAuthorize(event.detail.userInfo);
          }
        }
      })
    },

    userHasAuthorize:function(latestUserInfo) {
      //此时已授权，则拉取用户的登录数据，检查是否需要 写入或者更新数据库
      var that = this;
      this.writeLocalStorage({
        success: function(openId) {
          latestUserInfo['openId'] = openId;
          that.getUserAuth(openId, latestUserInfo);
        },
      });
    },

    getUserAuthorize:function(openId, latestUserInfo) {
      //此时未授权，需要询问用户获取授权
      wx.authorize({
        scope: 'scope.userInfo',
      }).then(res => {
        //此时成功授权
        console.log('authorize success');
        //授权成功后第一步操作，使用云函数，请求用户对应的openId，该openId是用户的唯一标记
        that.writeLocalStorage({
          success: function(openId) {
            that.getUserAuth(openId);
          },
        });
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
    },

    getUserAuth: function(openId, latestUserInfo) {
      //此处判断用户是否在数据库中，如果在的话，则直接读取，不在的话，则需要写入
      var that = this;
      util.getCurrentUserInfo({
        openId: openId,
        success: function(currentOpenId, remoteUserInfo) {
          util.uploadUserInfoToDatabase({
            openId: remoteUserInfo.data.length > 0 ?currentOpenId : '',
            data: latestUserInfo,
            success: function(userInfoDatabaseRes) {
              //通过用户信息，刷新页面
              //这里不再刷新子组件，而是交由page对页面进行刷新
              that.triggerEvent('refreshPersonalPageEvent', {'openId': currentOpenId, 'userInfo': latestUserInfo});
              //隐藏loadingView
              wx.hideLoading();
            },
            fail: function(err) {
              console.error(err)
            }
          });
        }
      });
    },

    writeLocalStorage: function(event) {
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: "login",
      }).then(loginRes =>{
        //这里当前js持有一份
        this.data.currentOpenId = loginRes['result']['openid'];
        //写入到磁盘一份，方便下次启动时读取
        wx.setStorage({
          key:'openid',
          data:loginRes['result']['openid'],          
        })
        event.success(this.data.currentOpenId);
      });
    }
  },
})
