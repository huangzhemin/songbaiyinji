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
  //调整产品能量计算方式，用爱投票，无法用单一的标准衡量多元化的人
  //多元化应该用多元化来衡量，而时间在其中充当每天的串连者，真正的裁判应该是爱
  //对数据进行处理，逻辑，循环遍历，检查任务的完成数据，是否为空
  if (!validList(yesterdayDoingTaskList)) {
    console.log('yesterdayDoingTaskList is empty');
    return [];
  }
  yesterdayDoingTaskList.forEach(doingTask => {
    if (validList(doingTask.supportUserList) && validList(doingTask.opposeUserList)) {
      //有人投支持票、反对票，自己是默认的支持者，只要支持者不小于反对者，就算成功
      //三心二意
      doingTask.status = (doingTask.supportUserList.length - doingTask.opposeUserList.length >= 0) ? 3 : 4;
    } else if (validList(doingTask.opposeUserList)) {
      //只有反对票，如果是1票，则仍然算成功，如果>1票，则算失败
      //二心二意
      doingTask.status = doingTask.opposeUserList.length > 1 ? 4 : 3;
    } else {
      //只有支持票，则成功(自己是默认的支持者)
      //一心一意
      doingTask.status = 3;
    }
  });
  return yesterdayDoingTaskList;
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
    if (!validList(yesterdayDoingTaskList)) {
      console.log('yesterdayDoingTaskList is empty');
      return;
    }
    let yesterdayCompleteTaskList = p_batchJudgeYesterdayDoingTaskList(yesterdayDoingTaskList);
    console.log('yesterdayCompleteTaskList', yesterdayCompleteTaskList);
    //将处理后的yesterdayCompleteTaskList，批量计算分值
    //创建现有用户积分字典
    const db = cloud.database();
    db.collection('userInfo').get().then(userInfoRes => {
      var finalUserPointsMap = {};
      let userInfoList = userInfoRes.data;
      userInfoList.forEach(userInfoDic => {
        finalUserPointsMap[userInfoDic['openId']] = userInfoDic['points'] != undefined ? userInfoDic['points'] : 0;
      });

      //更新数据库任务状态
      cloud.callFunction({
        // 要调用的云函数名称
        name: 'tcbDatabase',
        // 传递给云函数的参数
        data: {
          $url: "updateTaskStatusWithCompleteTaskList",
          yesterdayCompleteTaskList: yesterdayCompleteTaskList,
        }
      });
      
      //计算并更新用户积分映射字典
      console.log('finalUserPointsMap start:', finalUserPointsMap);
      //在计算之前，先将finalUserPointsMap保存一份下来，最终一起写入数据库

      var yesterdayUserPointsMap = JSON.parse(JSON.stringify(finalUserPointsMap));
      yesterdayCompleteTaskList.forEach(completeTask => {
        //更新用户积分映射字典
        updateUserPointsWithCurrentTask(completeTask, finalUserPointsMap);
      });
      console.log('yesterdayUserPointsMap', yesterdayUserPointsMap);
      console.log('finalUserPointsMap end:', finalUserPointsMap);
      //根据finalUserPointsMap计算finalUserRankingMap，一并写入userInfo数据库表
      let finalUserRankingMap = calculateUserRankingWithUserPointsMap(finalUserPointsMap);
      //finalUserPointsMap = {openId, points}
      //finalUserRankingMap = {openId, ranking}
      //finalUserPointsMap 能量积分上传，写数据库
      cloud.callFunction({
        name: 'tcbDatabase',
        data: {
          $url: "batchUpdateUserPoints",
          userPointsDic: finalUserPointsMap,
          yesterdayUserPointsDic: yesterdayUserPointsMap,
          userRankingDic: finalUserRankingMap,
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

function calculateUserRankingWithUserPointsMap(finalUserPointsMap) {
  //排序需要保持现有的finalUserPointsMap.keys的顺序，保证注册用户的时间序
  //开辟反转映射表，使用points做key，value遵从finalUserPointsMap的key顺序组成，sort后，直接写入排名
  var userPointsList = generateUserPointsListWithUserPointsMap(finalUserPointsMap);
  console.log('userPointsList', userPointsList);
  var finalUserRankingMap = generateFinalUserRankingMapWithUserPointsList(finalUserPointsMap, userPointsList);
  console.log('finalUserRankingMap', finalUserRankingMap);
  return finalUserRankingMap;
}

function generateUserPointsListWithUserPointsMap(finalUserPointsMap) {
  var userPointsList = [];
  for (const key in finalUserPointsMap) {
    const userPoints = finalUserPointsMap[key];
    userPointsList.push(userPoints);
  }
  return userPointsList;
}

function generateFinalUserRankingMapWithUserPointsList(finalUserPointsMap, userPointsList) {
  console.log('generateFinalUserRankingMapWithUserPointsList');
  let reverseUserPointsList = userPointsList.sort(function(a,b){return b-a});
  console.log('reverseUserPointsList', reverseUserPointsList);
  //生成reverseUserPointsRankingMap
  var reverseUserPointsRankingMap = {};
  for (let index = 1; index <= reverseUserPointsList.length; index++) {
    let points = reverseUserPointsList[index - 1];
    if (reverseUserPointsRankingMap[points] == undefined) {
      reverseUserPointsRankingMap[points] = index;
    }
  }
  console.log('reverseUserPointsRankingMap', reverseUserPointsRankingMap);
  var finalUserRankingMap = {};
  //遍历用户积分 map
  for (const key in finalUserPointsMap) {
    //将用户积分直接映射为排名，赋值给finalUserRankingMap
    let currentUserPoints = finalUserPointsMap[key];
    //获取排名
    let ranking = reverseUserPointsRankingMap[currentUserPoints];
    //赋值排名
    finalUserRankingMap[key] =  ranking;
  }
  return finalUserRankingMap;
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
  if (validList(supportUserList)) {
    supportUserList.forEach(supportUserOpenId => {
      //支持者的当前积分
      let taskSupportUserPoints = finalUserPointsMap[supportUserOpenId];
      //更新支持者积分
      finalUserPointsMap[supportUserOpenId] = taskSupportUserPoints + multiRatio;
    });    
  }
  
  //反对者积分计算
  if (validList(opposeUserList)) {
    opposeUserList.forEach(opposeUserOpenId => {
      //反对者的当前积分
      let taskOpposeUserPoints = finalUserPointsMap[opposeUserOpenId];
      //更新反对者积分
      finalUserPointsMap[opposeUserOpenId] = taskOpposeUserPoints - multiRatio;
    });   
  }
  
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