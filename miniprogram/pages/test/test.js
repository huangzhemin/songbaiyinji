// miniprogram/pages/test/test.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
const taskInfo = db.collection('taskInfo')
const _ = db.command;
const util = require('../../util.js');
const { validList } = require('../../util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  userLoginAndGetUserInfo: function (event) {
    let that = this;
    //通过用户信息，刷新页面
    util.userLoginAndGetUserInfo({
      userInfo: event.detail.userInfo,
      success: function (currentOpenId, latestUserInfo) {
        console.log('personalProfileCell getUserInfo', currentOpenId, latestUserInfo);
        //这里不再刷新子组件，而是交由page对页面进行刷新
        console.log('currentOpenId', currentOpenId);
        console.log('latestUserInfo', latestUserInfo);
        this.data.userInfo = latestUserInfo;
        wx.hideLoading();
      }
    });
  },

  requestSubscribeMessage: function () {
    let subscribeId = '8WEvy8r0xt4yZ4d5MGCUN0UhuEpDnWWht6kSHbgUVVQ';
    console.log('test requestSubscribeMessage start');
    wx.requestSubscribeMessage({
      tmplIds: [subscribeId],
      success(res) {
        console.log('requestSubscribeMessage success', res);
        util.getCurrentUserInfo({
          success: function (openId, userInfo) {
            console.log('userInfo', userInfo.data[0]);
            console.log('openId', openId);
            var subscribeList = [];
            if (util.validList(userInfo.subscribeList)) {
              subscribeList = userInfo.subscribeList;
            }
            
            console.log('subscribeList before', subscribeList);
            
            if (subscribeList.indexOf(subscribeId) == -1) {
              subscribeList.push(subscribeId);
            }
            console.log('subscribeList after', subscribeList);
            wx.cloud.callFunction({
              // 要调用的云函数名称
              name: 'tcbDatabase',
              // 传递给云函数的参数
              data: {
                $url: "updateOpenIdSubscribeList",
                openId: openId,
                subscribeList: subscribeList,
              }
            })

            //获取subscribeId对应的订阅用户IdList
            wx.cloud.callFunction({
              // 要调用的云函数名称
              name: 'tcbDatabase',
              // 传递给云函数的参数
              data: {
                $url: "getSubscribeOpenIdList",
                subscribeId: subscribeId,
              }
            }).then (res => {
              //获取现阶段subscribeId对应的用户IdList
              console.log(res);
              let resList = res.result.data.data;
              var openIdList = [];
              var needAdd = true;
              if (validList(resList)) {
                openIdList = res.result.data.data[0].openIdList;  
                needAdd = false;
              }
              if (openIdList.indexOf(openId) == -1) {
                openIdList.push(openId);
              }
              console.log('openIdList', openIdList);
              wx.cloud.callFunction({
                // 要调用的云函数名称
                name: 'tcbDatabase',
                // 传递给云函数的参数
                data: {
                  $url: "updateSubscribeOpenIdList",
                  subscribeId: subscribeId,
                  openIdList: openIdList,
                  updateSubscribeType: needAdd ? 'add' : 'update',
                }
              })
            });
          }
        });
      },
      fail(err) {
        console.log('requestSubscribeMessage fail', err);
      }
    });
    console.log('test requestSubscribeMessage end');
  },

// 返回当前任务状态的判断，type = (all/doing/complete)
p_getStatusCondition: function (type) {
  if (type == 'all') {
    return _.in([0, 1, 2, 3, 4]);
  } else if (type == 'doing') {
    return _.in([0, 1, 2]);
  } else {
    return _.in([3, 4]);
  }
},

pmInformToWeixin: function () {
  console.log('pmInformToWeixin');
  wx.cloud.callFunction({
    name: "pmInformToWeixin",
  }).then(res => {
    console.log('pmInformToWeixin res', res);
  });
},

calculatePoints: function () {
  console.log('calculatePoints local test');
  // wx.cloud.callFunction({
  //   // 要调用的云函数名称
  //   name: "calculatePoints",
  // }).then(res => {
  //   console.log('res', res);
  // });

  console.log('nowtime.getTimezoneOffset()', new Date().getTimezoneOffset());
  let yesterday24hourTimestamp = (new Date().setHours(0, 0, 0, 0)) / 1000;
  console.log('yesterday24hourTimestamp', yesterday24hourTimestamp);
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: "tcbDatabase",
    data: {
      $url: 'getDoingTaskListYesterday',
    }
  }).then(res => {
    //拿到到截止日期前一天24:00的 所有正在进行中的数据
    console.log('res', res.result.data.data);
    // let yesterday24hourDoingTaskList = res.result.data.data;
    // //对数据进行处理，逻辑，循环遍历，检查任务的完成数据，是否为空
    // yesterday24hourDoingTaskList.forEach(doingTask => {
    //   console.log('doingTask', doingTask.status);
    //   if (util.validList(doingTask.taskMediaList)) {
    //     doingTask.status = 3;
    //   } else {
    //     doingTask.status = 4;
    //   }
    //   console.log('doingTask', doingTask.status);
    // });
  });

  //批量获取用户积分，返回用户积分字典, {openId1: points1, openId2: points2, openId3: point3}
  // userInfo.get().then(res => {
  //   var userPointsMap = {};
  //   res.data.forEach(userInfoDic => {
  //     userPointsMap[userInfoDic['openId']] = userInfoDic['points'] != undefined ? userInfoDic['points'] : 0;
  //   });
  //   console.log('userPointsMap', userPointsMap);
  // });
},

updateRankingList: function () {
  console.log('test');

  //   //此处将排序后的结果写入数据库rankingUserInfo，方便小程序拉取
  //   //需要登录accesstoken接入，批量更新，
  //   // wx.cloud.callFunction({
  //   //   name: "tcbDatabase",
  //   //   data: {
  //   //     $url: 'batchWriteUserPointRankingList',
  //   //     userPointsRankingList: res.result.data.list,
  //   //   }
  //   // }).then(res1 => {
  //   //   console.log('userPointsRankingList write result', res1);
  //   // });
  // });
},

adjustDicData: function () {
  console.log('adjustDicData');
  var finalUserPointsMap = {
    'a': 1,
    'b': 2,
    'c': 3,
  };
  //计算并更新用户积分映射字典
  console.log('finalUserPointsMap start:', finalUserPointsMap);
  //在计算之前，先将finalUserPointsMap保存一份下来，最终一起写入数据库
  var yesterdayUserPointsMap = JSON.parse(JSON.stringify(finalUserPointsMap));
  finalUserPointsMap['a'] = 2;
  finalUserPointsMap['b'] = 3;
  finalUserPointsMap['c'] = 4;
  console.log('yesterdayUserPointsMap end:', yesterdayUserPointsMap);
  console.log('finalUserPointsMap end:', finalUserPointsMap);
}
})