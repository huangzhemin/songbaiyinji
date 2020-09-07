// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  return await cloud.callFunction({
    // 要调用的云函数名称
    name: "tcbDatabase",
    data: {
      $url: 'batchGetUserPointsRankingList',
    }
  });

  // .then(res => {
  //   console.log('rankingUserPoints:', res.result.data.list);
    
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

//用户积分排序
//1.读取用户数据库，无法本地调试，需要建立testPage触发
//2.根据points对用户进行排序
//3.输出到rankingUserList中 直接循环添加，顺序不确定，等接入AccessToken之后批量更新

//4.添加触发器，定时刷新

//5.小程序端，拉取数据，展示逻辑已经具备
//6.完成个人页的点击跳转，参数传递，类似任务底层页，传递openId即可
//7.个人页通过openId信息拉取，类似我的个人页