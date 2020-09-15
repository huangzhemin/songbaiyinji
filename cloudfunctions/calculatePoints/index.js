// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

//判断字符串有效性
function validStr(inputStr) {
  return !(typeof(inputStr) == '' 
          || typeof(inputStr) == 'undefined' 
          || inputStr == undefined 
          || inputStr.length == 0);
}

//判断列表有效性
function validList(inputList) {
  return !(typeof(inputList) == [] 
          || inputList == undefined 
          || inputList.length == 0);
}

//判断截止至昨天24点的任务完成情况
function p_batchJudgeYesterdayDoingTaskList(yesterdayDoingTaskList) {
  //对数据进行处理，逻辑，循环遍历，检查任务的完成数据，是否为空
  yesterdayDoingTaskList.forEach(doingTask => {
    if (validList(doingTask.taskMediaList)) {
      doingTask.status = 3;
    } else {
      doingTask.status = 4;
    }
  });
}
// 云函数入口函数
exports.main = async (event, context) => {
  //此处拉取今天0点之前的所有的任务列表
  cloud.callFunction({
    // 要调用的云函数名称
    name: 'tcbDatabase',
    // 传递给云函数的参数
    data: {
      $url: "getDoingTaskListYesterday",
    }
  }).then(res => {
    //此处根据返回数据，直接判断任务是否完成
    var yesterdayDoingTaskList = res.result.data.data;
    p_batchJudgeYesterdayDoingTaskList(yesterdayDoingTaskList);
    //将处理后的yesterdayDoingTaskList，批量计算分值
    //创建现有用户积分字典
    const db = cloud.database();
    db.collection('userInfo').get().then(userInfoRes => {
      var finalUserPointsMap = {};
      userInfoRes.data.forEach(userInfoDic => {
        finalUserPointsMap[userInfoDic['openId']] = userInfoDic['points'] != undefined ? userInfoDic['points'] : 0;
      });

      console.log('finalUserPointsMap start:', finalUserPointsMap);
      yesterdayDoingTaskList.forEach(completeTask => {
        //更新数据库任务状态
        updateTaskStatusWithCompleteTask(completeTask);
        //更新用户积分映射字典
        updateUserPointsWithCurrentTask(completeTask, finalUserPointsMap);
      });
      console.log('finalUserPointsMap end:', finalUserPointsMap);
      
      //此处准备最终的 openId 和 Points的map写入
      //积分上传，写数据库
      cloud.callFunction({
        name: 'tcbDatabase',
        data: {
          $url: "batchUpdateUserPoints",
          userPointsDic: finalUserPointsMap,
        },
      });
    })
  });
  
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}

function updateTaskStatusWithCompleteTask(taskInfoDic) {
  const db = cloud.database();
  db.collection('taskInfo').where({
    openId: taskInfoDic['openId'],
    taskId: taskInfoDic['taskId'],
  }).update({
    data: {
      status: taskInfoDic['status'],
    }
  });
}

function updateUserPointsWithCurrentTask(taskInfoDic, finalUserPointsMap) {
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

  //此处模拟userPointDic
  // userPointsDic = {
  //   'oBG1A5f75CT8Bj1gAG4OMkXgDyXM': 0, 
  //   'oBG1A5f75CT8Bj1gAG4OMkXgDyX1': 0,
  //   'oBG1A5f75CT8Bj1gAG4OMkXgDyX2': 0,
  //   'oBG1A5f75CT8Bj1gAG4OMkXgDyX3': 0,
  //   'oBG1A5f75CT8Bj1gAG4OMkXgDyY1': 0,
  // };
  //计算积分情况
  finalUserPointsMap = calculatePoints(taskInfoDic, finalUserPointsMap);
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

//taskDic代表当前结束的任务
//这里userPointsDic表示着所有需要更新的用户与积分的对应关系
function calculatePoints(taskDic, finalUserPointsMap) {
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
  let taskPlannerPoints = finalUserPointsMap[taskDic['openId']];
  //任务创建者获得的积分
  let taskPlannerGainPoints = multiRatio;
  //更新任务创建者积分
  finalUserPointsMap[taskDic['openId']] = taskPlannerPoints + taskPlannerGainPoints;

  //支持者积分计算
  supportUserList.forEach(supportUserOpenId => {
    //支持者的当前积分
    let taskSupportUserPoints = finalUserPointsMap[supportUserOpenId];
    //更新支持者积分
    finalUserPointsMap[supportUserOpenId] = taskSupportUserPoints + multiRatio;
  });
  //反对者积分计算
  opposeUserList.forEach(opposeUserOpenId => {
    //反对者的当前积分
    let taskOpposeUserPoints = finalUserPointsMap[opposeUserOpenId];
    //更新反对者积分
    finalUserPointsMap[opposeUserOpenId] = taskOpposeUserPoints - multiRatio;
  });
  
  //这里返回更新后的用户积分字典
  return finalUserPointsMap;
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