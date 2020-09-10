// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  //此处创建用户任务字典
  var taskInfoDic = {};
  //拉取用户对应taskId的记录
  cloud.callFunction({
    // 要调用的云函数名称
    name: 'tcbDatabase',
    // 传递给云函数的参数
    data: {
      $url: "taskInfoWithOpenIdAndTaskId",
      openId: event['openId'],
      taskId: event['taskId'],
    }
  }).then(res => {
    //这里层级结构，需要注意
    taskInfoDic = res.result.data.data[0];
    console.log('taskInfoDic', taskInfoDic)
    updateUserPointsWithCurrentTask(taskInfoDic);
  }).catch(erro => {
    console.error(err);
  });
  
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

function updateUserPointsWithCurrentTask(taskInfoDic) {
  // taskInfoDic = {
  //   "_id":"f241f5fe5f534a55001626f301bf7c5c",
  //   "pubTime":"下午4:20:47",
  //   "taskCompleteDesc":"4",
  //   "taskTitle":"4",
  //   "thumbImg":"",
  //   "_openid":"oBG1A5f75CT8Bj1gAG4OMkXgDyXM",
  //   "avatar":"https://thirdwx.qlogo.cn/mmopen/vi_32/ZbibUK9Ywia2QOzPHx7Jwmv6jWIkDqvn3PUvz9CHepnlFpBHub4kLibgVkG8JgdoGicHia2icWLW3TQ8VJhpbdxLkZsQ/132",
  //   "nickName":"Patrik没有C",
  //   "taskMediaList":[],
  //   "taskPlanDesc":"4",
  //   "openId":"oBG1A5f75CT8Bj1gAG4OMkXgDyXM",
  //   "status":4,
  //   "taskId":"task3",
  //   "opposeUserList":["oBG1A5f75CT8Bj1gAG4OMkXgDyY1"],
  //   "supportUserList":[
  //     "oBG1A5f75CT8Bj1gAG4OMkXgDyX1", 
  //     "oBG1A5f75CT8Bj1gAG4OMkXgDyX2", 
  //     "oBG1A5f75CT8Bj1gAG4OMkXgDyX3"]};

  //此处创建需要更新的用户OpenId数组
  var userOpenIdList = [];
  //此处根据任务数据，更新用户的OpenId数组
  userOpenIdList = generateUserOpenIdList(taskInfoDic)
  console.log('userOpenIdList', userOpenIdList);

  //此处创建空字典
  var userPointsDic = {};
  //数据库积分拉取
  cloud.callFunction({
    name: 'tcbDatabase',
    data: {
      $url: "batchGetUserPoints",
      userOpenIdList: userOpenIdList,
    },
  }).then(res => {
    //此处res返回的是用户OpenId与Points构成的字典
    userPointsDic = convertDatabaseUserInfoListToUserPointsDic(res.result.data.data);
    //此处模拟userPointDic
    // userPointsDic = {
    //   'oBG1A5f75CT8Bj1gAG4OMkXgDyXM': 0, 
    //   'oBG1A5f75CT8Bj1gAG4OMkXgDyX1': 0,
    //   'oBG1A5f75CT8Bj1gAG4OMkXgDyX2': 0,
    //   'oBG1A5f75CT8Bj1gAG4OMkXgDyX3': 0,
    //   'oBG1A5f75CT8Bj1gAG4OMkXgDyY1': 0,
    // };

    //计算积分情况
    console.log('start:', userPointsDic);
    userPointsDic = calculatePoints(taskInfoDic, userPointsDic);
    console.log('end:', userPointsDic);
    
    //积分上传，写数据库
    cloud.callFunction({
      name: 'tcbDatabase',
      data: {
        $url: "batchUpdateUserPoints",
        userPointsDic: userPointsDic,
      },
    });
  }).catch(err => {
    console.error(err);
  });
}

//通过任务的字典信息，生成需要更新的用户的OpenIdList
function generateUserOpenIdList(taskInfoDic) {
  var userOpenIdList = [];
  //添加创建任务的用户openId
  userOpenIdList.push(taskInfoDic['openId']);
  //添加支持者的用户openIdList
  if (taskInfoDic['supportUserList']) {
    userOpenIdList = userOpenIdList.concat(taskInfoDic['supportUserList']);
  }
  //添加反对者的用户openIdList
  if (taskInfoDic['opposeUserList']) {
    userOpenIdList = userOpenIdList.concat(taskInfoDic['opposeUserList']);
  }
  return userOpenIdList;
}

function convertDatabaseUserInfoListToUserPointsDic(userInfoList) {
  var userPointsDic = {};
  userInfoList.forEach(userInfo => {
    let key = userInfo['openId'];
    let value = userInfo['points'] != undefined ? userInfo['points'] : 0;
    userPointsDic[key] = value;
  });
  return userPointsDic;
}

//taskDic代表当前结束的任务
//这里userPointsDic表示着所有需要更新的用户与积分的对应关系
function calculatePoints(taskDic, userPointsDic) {
  //获取支持者数组
  let supportUserList = taskDic['supportUserList'];
  //获取反对者数组
  let opposeUserList = taskDic['opposeUserList'];
  //获取当前任务的结束状态，
  //成功: status = 3
  //失败: status = 4
  let status = taskDic['status'];
  //计算积分乘数
  var multiRatio = 0;
  if (status == 3) {
    // 完成计算
    multiRatio = 1;
  } else if (status == 4) {
    // 失败计算
    multiRatio = -1;
  }
  
  //计算积分调整后的结果
  //之前任务创建者的积分
  let taskPlannerPoints = userPointsDic[taskDic['openId']];
  //任务创建者获得的积分
  let taskPlannerGainPoints = multiRatio;
  //更新任务创建者积分
  userPointsDic[taskDic['openId']] = taskPlannerPoints + taskPlannerGainPoints;

  //支持者积分计算
  supportUserList.forEach(supportUserOpenId => {
    //支持者的当前积分
    let taskSupportUserPoints = userPointsDic[supportUserOpenId];
    //更新支持者积分
    userPointsDic[supportUserOpenId] = taskSupportUserPoints + multiRatio;
  });
  //反对者积分计算
  opposeUserList.forEach(opposeUserOpenId => {
    //反对者的当前积分
    let taskOpposeUserPoints = userPointsDic[opposeUserOpenId];
    //更新反对者积分
    userPointsDic[opposeUserOpenId] = taskOpposeUserPoints - multiRatio;
  });
  
  //这里返回更新后的用户积分字典
  return userPointsDic;
}

//通过openId 和 taskId，可以拼接出task的where信息
//获取到用户的任务
//从任务中提取信息，分别为support 和 oppose，根据当前的status状态，来进行计算
//计算规则
// 成功：supportUser.points ++, opposeUser.points -- ，当前用户 +   (supportUser.length - opposeUser.length) * 1
// 失败：supportUser.points ++, opposeUser.points -- ，当前用户 +   (supportUser.length - opposeUser.length) * -1
//读取并更新用户信息

let result = exports.main({
}, {}).then(res => {
  console.log(res);
});