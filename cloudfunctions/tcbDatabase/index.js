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
    await next(); // 执行下一中间件
  });

  // 路由为数组表示，该中间件适用于 任务信息获取
  app.router(['taskInfoWithOpenIdAndTaskId', 'batchGetUserPoints', 'batchUpdateUserPoints'], async (ctx, next) => {
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

  return app.serve();
}

let result = exports.main({
  openId: 'oBG1A5f75CT8Bj1gAG4OMkXgDyXM',
  taskId: 'task4',
  $url: "taskInfoWithOpenIdAndTaskId"
}, {}).then(res => {
  console.log(res);
});