// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

function p_toValidNum(inputData) {
  return inputData != undefined ? inputData : 0;
}

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('pmInform invoked');
  let subscribeId = '8WEvy8r0xt4yZ4d5MGCUN0UhuEpDnWWht6kSHbgUVVQ';
  //获取subscribeId对应的订阅用户IdList
  p_getIdListWithSubscribeId(subscribeId);
  
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

function p_getIdListWithSubscribeId(subscribeId) {
  cloud.callFunction({
    // 要调用的云函数名称
    name: 'tcbDatabase',
    // 传递给云函数的参数
    data: {
      $url: "getSubscribeOpenIdList",
      subscribeId: subscribeId,
    }
  }).then (res => {
    let subscribeOpenIdListRes = res.result.data.data[0];
    let subscribeId = subscribeOpenIdListRes.subscribeId;
    let openIdList = subscribeOpenIdListRes.openIdList;
    console.log('subscribeOpenIdListRes', subscribeOpenIdListRes);
    console.log('subscribeId', subscribeId);
    console.log('openIdList', openIdList);
    p_batchSendInformWithSubscribeIdAndOpenIdList(subscribeId, openIdList);
  });
}

function p_batchSendInformWithSubscribeIdAndOpenIdList(subscribeId, openIdList) {
  for (const key in openIdList) {
    const openId = openIdList[key];
    //此处根据openId，获取用户信息
    cloud.callFunction({
      // 要调用的云函数名称
      name: 'tcbDatabase',
      // 传递给云函数的参数
      data: {
        $url: "getUserInfoWithOpenId",
        openId: openId,
      }
    }).then(res => {
      console.log('userInfo', res.result.data.data[0]);
      let userInfo = res.result.data.data[0];
      p_sendInformWithSubscribeIdAndOpenIdList(subscribeId, userInfo);
    });
  }
}

function p_sendInformWithSubscribeIdAndOpenIdList(subscribeId, userInfo) {
  let openId = userInfo.openId;
  let userNick = userInfo.nickName;
  let totalPoints = p_toValidNum(userInfo.points);
  let changePoints = totalPoints - p_toValidNum(userInfo.yesterdayPoints);
  let yesterdayData = p_yesterDayData();
  //获取现阶段subscribeId对应的用户IdList

  cloud.openapi.subscribeMessage.send({
    touser: openId,
    page: 'pages/tabbar/ranking/ranking',
    lang: 'zh_CN',
    data: {
      thing2: {
        value: userNick
      },
      thing3: {
        value: totalPoints.toString()
      },
      thing7: {
        value: changePoints.toString()
      },
      date5: {
        value: yesterdayData
      },
    },
    templateId: subscribeId,
    miniprogramState: 'developer'
  }) 
}

function p_yesterDayData() {
  let beijingLondonTimeDifference = 8 * 60 * 60;
  let nowtime = new Date();
  console.log('nowtime', nowtime);
  //第一步，需要将格林尼治时间转换到北京时间同样的时间点上
  let nowBeijingTime = new Date(Date.parse(nowtime) + beijingLondonTimeDifference * 1000);
  console.log('nowBeijingTime', nowBeijingTime);
  //第二步，将时间还原到北京时间的0点
  let zero_beijing = nowBeijingTime.setHours(0, 0, 0, 0) / 1000;
  console.log('zero_beijing', zero_beijing);
  //第三步，因为北京位于东八区，还原到格林尼治的0点，需要-8，然后通过北京0点的时间，减去一个1000，得到昨天的某个时间点，返回具体的 年-月-日即可
  yesterday24hourTimestamp = zero_beijing - beijingLondonTimeDifference - 1000;
  console.log('yesterday24hourTimestamp', yesterday24hourTimestamp);
  let yesterdayDate = new Date
  (yesterday24hourTimestamp*1000);
  var year = yesterdayDate.getFullYear()
  var month = yesterdayDate.getMonth() + 1
  var day = yesterdayDate.getDate()
  return (year+'-'+month+'-'+day);
}