// miniprogram/pages/test/test.js
const db = wx.cloud.database()
const userInfo = db.collection('userInfo')
const taskInfo = db.collection('taskInfo')
const _ = db.command;
const util = require('../../util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  // 返回当前任务状态的判断，type = (all/doing/complete)
  p_getStatusCondition: function(type) {
    if (type == 'all') {
      return _.in([0, 1, 2, 3, 4]);
    } else if (type == 'doing') {
      return _.in([0, 1, 2]);
    } else {
      return _.in([3, 4]);
    }
  },

  calculatePoints: function() {
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

  updateRankingList: function() {
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
  }
})