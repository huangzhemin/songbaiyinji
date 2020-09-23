// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

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

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);

  const app = new TcbRouter({
    event
  });

  // app.use 表示该中间件会适用于所有的路由
  app.use(async (ctx, next) => {
    ctx.data = {};
    ctx.data.openId = event.openId;
    ctx.data.taskId = event.taskId;
    ctx.data.userOpenIdList = event.userOpenIdList;
    ctx.data.yesterdayUserPointsDic = event.yesterdayUserPointsDic;
    ctx.data.userPointsDic = event.userPointsDic;
    ctx.data.userRankingDic = event.userRankingDic;
    ctx.data.userPointsRankingList = event.userPointsRankingList;
    ctx.data.taskNumOnePage = event.taskNumOnePage;
    ctx.data.taskListType = event.taskListType;
    ctx.data.lastPubTime = event.lastPubTime;
    ctx.data.yesterdayCompleteTaskList = event.yesterdayCompleteTaskList;
    await next(); // 执行下一中间件
  });

  // 路由为数组表示，该中间件适用于 任务信息获取
  let routerList = [
    'getDoingTaskListYesterday',
    'taskInfoWithOpenIdAndTaskId', 
    'batchGetUserPoints', 
    'batchUpdateUserPoints',
    'batchGetUserInfo',
    'batchGetUserPointsRankingList',
    'batchWriteUserPointRankingList',
    'getUserNextPageTaskListWithCurrentStatus',
    'getNextPageTaskListWithCurrentStatus',
    'updateTaskStatusWithCompleteTaskList',
  ];
  app.router(routerList, async (ctx, next) => {
    await next();
  });

  // 获取24:00之前所有「正在进行」中的任务
  app.router('getDoingTaskListYesterday', async (ctx, next) => {
    console.log('getDoingTaskListYesterday invoke');
    const db = cloud.database();
    const _ = db.command;

    let beijingLondonTimeDifference = 8 * 60 * 60;
    let nowtime = new Date();
    console.log('nowtime', nowtime);
    //第一步，需要将格林尼治时间转换到北京时间同样的时间点上
    let nowBeijingTime = new Date(Date.parse(nowtime) + beijingLondonTimeDifference * 1000);
    console.log('nowBeijingTime', nowBeijingTime);
    //第二步，将时间还原到北京时间的0点
    let zero_beijing = nowBeijingTime.setHours(0, 0, 0, 0) / 1000;
    console.log('zero_beijing', zero_beijing);
    //第三步，因为北京位于东八区，还原到格林尼治的0点，需要-8
    yesterday24hourTimestamp = zero_beijing - beijingLondonTimeDifference;
    console.log('yesterday24hourTimestamp', yesterday24hourTimestamp);
    ctx.data.res = await db.collection('taskInfo').where({
      status: p_getStatusCondition('doing'),
      pubTime: _.lt(yesterday24hourTimestamp),
    }).get();
    await next();
  }, async (ctx) => {
    console.log('ctx.data:', ctx.data);
    ctx.body = {
      code: 0,
      data: ctx.data.res
    };
  });

  // 获取当前用户 当前taskId的任务信息
  app.router('taskInfoWithOpenIdAndTaskId', async (ctx, next) => {
    console.log('taskInfoWithOpenIdAndTaskId invoke');
    const db = cloud.database();
    const _ = db.command;

    ctx.data.res = await db.collection('taskInfo').where({
      openId: ctx.data.openId,
      taskId: ctx.data.taskId,
    }).get();
    await next();
  }, async (ctx) => {
    console.log('ctx.data:', ctx.data);
    ctx.body = {
      code: 0,
      data: ctx.data.res
    };
  });

  // 批量获取用户积分，返回 字典数组 [{openId1, points}, {openId2, points}, {openId3, points}]
  app.router('batchGetUserPoints', async (ctx, next) => {
    console.log('batchGetUserPoints invoke');
    const db = cloud.database();
    const _ = db.command;

    ctx.data.res = await db.collection('userInfo').where({
      openId: _.in(ctx.data.userOpenIdList)
    }).get();
    await next();
  }, async (ctx) => {
    console.log('ctx.data:', ctx.data);
    ctx.body = {
      code: 0,
      data: ctx.data.res
    };
  });

  //批量更新用户积分，需要关注，如何对于col做 points维度的更新
  app.router('batchUpdateUserPoints', async (ctx, next) => {
    console.log('batchUpdateUserPoints invoke');
    const db = cloud.database();
    const _ = db.command;

    let keysList = Object.keys(ctx.data.userPointsDic);
    if (!validList(keysList)) {
      return;
    }
    if (!validList(keysList)) {
      console.log('keysList is empty');
      return;
    }
    console.log('ctx.data', ctx.data);
    keysList.forEach(userOpenId => {
      var yesterdayPoints = ctx.data.yesterdayUserPointsDic[userOpenId];
      var points = ctx.data.userPointsDic[userOpenId];
      var ranking = ctx.data.userRankingDic[userOpenId]
      db.collection('userInfo').where({
        openId: userOpenId,
      }).update({
        data: {
          yesterdayPoints: yesterdayPoints,
          points: points,
          ranking: ranking,
        }
      });
    });
    await next();
  }, async (ctx) => {
    console.log('ctx.data:', ctx.data);
    ctx.body = {
      code: 0,
      data: ctx.data.res
    };
  });

  app.router('batchGetUserInfo', async (ctx, next) => {
    console.log('batchGetUserInfo invoke');
    const db = cloud.database();
    const _ = db.command;

    ctx.data.res = await db.collection('userInfo').get();
    console.log('res', ctx.data.res);
    await next();
  }, async (ctx) => {
    console.log('ctx.data:', ctx.data);
    ctx.body = {
      code: 0,
      data: ctx.data.res
    }
  });

  app.router('batchGetUserPointsRankingList', async (ctx, next) => {
    console.log('batchGetUserPointsRankingList invoke');
    const db = cloud.database();
    const _ = db.command;

    ctx.data.res = await db.collection('userInfo').orderBy('points', 'desc').limit(100).get();
    await next();
  }, async (ctx) => {
    console.log('ctx.data:', ctx.data);
    ctx.body = {
      code: 0,
      data: ctx.data.res
    }
  });
  
  app.router('batchWriteUserPointRankingList', async (ctx, next) => {
    console.log('batchWriteUserPointRankingList invoke');
    console.log('userPointsRankingList', ctx.data.userPointsRankingList);
    const db = cloud.database();
    const _ = db.command;

    // 根据userPointsRankingList，生成删除数组
    var userPointsRankingOpenIdList = [];
    let userPointsRankingList = ctx.data.userPointsRankingList;
    if (!validList(userPointsRankingList)) {
      console.log('userPointsRankingList is empty');
      return;
    }
    userPointsRankingList.forEach(userInfo => {
      userPointsRankingOpenIdList.push(userInfo['openId']);
    });
    console.log('userPointsRankingOpenIdList', userPointsRankingOpenIdList);
    // 删除rankingUserInfo现有的数据
    await db.collection('rankingUserInfo').where({
      openId: _.in(userPointsRankingOpenIdList)
    }).remove().then(res => {
      // 将新生成的userPointsRankingList更新到数据列表中
      for (const index in userPointsRankingOpenIdList) {
        db.collection('rankingUserInfo').add({
          data: ctx.data.userPointsRankingList[index],
        });
      }
    });
  });

  app.router('getUserNextPageTaskListWithCurrentStatus', async (ctx, next) => {
    console.log('getUserNextPageTaskListWithCurrentStatus invoke');
    console.log('ctx.data', ctx.data);
    const db = cloud.database();
    const _ = db.command;

    ctx.data.res = await db.collection('taskInfo').limit(ctx.data.taskNumOnePage).where({
      openId: ctx.data.openId,
      status: p_getStatusCondition(ctx.data.taskListType),
      pubTime: _.lt(ctx.data.lastPubTime)
    }).orderBy('pubTime', 'desc').get();
    await next();
  }, async (ctx) => {
    console.log('ctx.data:', ctx.data);
    ctx.body = {
      code: 0,
      data: ctx.data.res,
    }
  });

  app.router('getNextPageTaskListWithCurrentStatus', async (ctx, next) => {
    console.log('getNextPageTaskListWithCurrentStatus invoke');
    console.log('ctx.data', ctx.data);
    const db = cloud.database();
    const _ = db.command;

    ctx.data.res = await db.collection('taskInfo').limit(ctx.data.taskNumOnePage).where({
      status: p_getStatusCondition(ctx.data.taskListType),
      pubTime: _.lt(ctx.data.lastPubTime)
    }).orderBy('pubTime', 'desc').get();
    await next();
  }, async (ctx) => {
    console.log('ctx.data:', ctx.data);
    ctx.body = {
      code: 0,
      data: ctx.data.res,
    }
  });

  app.router('updateTaskStatusWithCompleteTaskList', async (ctx, next) => {
    console.log('updateTaskStatusWithCompleteTaskList invoke');
    console.log('ctx.data', ctx.data);
    const db = cloud.database();
    const _ = db.command;

    console.log('updateTaskStatusWithCompleteTaskList before', ctx.data.yesterdayCompleteTaskList)
    let yesterdayCompleteTaskList = ctx.data.yesterdayCompleteTaskList;
    console.log('updateTaskStatusWithCompleteTaskList after', yesterdayCompleteTaskList)
    if (!validList(yesterdayCompleteTaskList)) {
      console.log('yesterdayCompleteTaskList is empty');
      return;
    }
    yesterdayCompleteTaskList.forEach(completeTask => {
      db.collection('taskInfo').where({
        openId: completeTask['openId'],
        taskId: completeTask['taskId'],
      }).update({
        data: {
          status: completeTask['status'],
        }
      });
    });
  });

  return app.serve();
}

// 返回当前任务状态的判断，type = (all/doing/complete)
function p_getStatusCondition(type) {
  const _ = cloud.database().command;
  if (type == 'all') {
    return _.in([0, 1, 2, 3, 4]);
  } else if (type == 'doing') {
    return _.in([0, 1, 2]);
  } else {
    return _.in([3, 4]);
  }
}

let result = exports.main({
  openId: 'oBG1A5f75CT8Bj1gAG4OMkXgDyXM',
  taskId: 'task4',
  $url: "taskInfoWithOpenIdAndTaskId"
}, {}).then(res => {
  console.log(res);
});