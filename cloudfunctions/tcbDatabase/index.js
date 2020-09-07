// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

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
    ctx.data.userPointsDic = event.userPointsDic;
    ctx.data.userPointsRankingList = event.userPointsRankingList;
    await next(); // 执行下一中间件
  });

  // 路由为数组表示，该中间件适用于 任务信息获取
  let routerList = [
    'taskInfoWithOpenIdAndTaskId', 
    'batchGetUserPoints', 
    'batchUpdateUserPoints',
    'batchGetUserInfo',
    'batchGetUserPointsRankingList',
    'batchWriteUserPointRankingList',
  ];
  app.router(routerList, async (ctx, next) => {
    await next();
  });

  // 获取当前用户 当前taskId的任务信息
  app.router('taskInfoWithOpenIdAndTaskId', async (ctx, next) => {
    console.log('taskInfoWithOpenIdAndTaskId invoke');
    const db = cloud.database()
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

    var res = [];
    let keysList = Object.keys(ctx.data.userPointsDic);
    keysList.forEach(userPointsKey => {
      var points = ctx.data.userPointsDic[userPointsKey];
      db.collection('userInfo').where({
        openId: userPointsKey,
      }).update({
        data: {
          points: points,
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
    ctx.data.res = await db.collection('userInfo').aggregate()
    .sort(
      {
        points: -1,
      }
    ).limit(100).end();
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
    const db = cloud.database();
    const _ = db.command;

    console.log('userPointsRankingList', ctx.data.userPointsRankingList);

    // 根据userPointsRankingList，生成删除数组
    var userPointsRankingOpenIdList = [];
    ctx.data.userPointsRankingList.forEach(userInfo => {
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

  return app.serve();
}

let result = exports.main({
  openId: 'oBG1A5f75CT8Bj1gAG4OMkXgDyXM',
  taskId: 'task4',
  $url: "taskInfoWithOpenIdAndTaskId"
}, {}).then(res => {
  console.log(res);
});