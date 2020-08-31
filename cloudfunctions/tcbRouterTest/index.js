// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event });

  // app.use 表示该中间件会适用于所有的路由
  app.use(async (ctx, next) => {
    console.log('enter app user')
    ctx.data = {};
    ctx.data.openId = event.userInfo.openId;
    await next(); // 执行下一中间件
    console.log('exit app user')
  });

  // 路由为数组表示，该中间件适用于 user 和 timer 两个路由
  app.router(['user', 'school'], async (ctx, next) => {
    console.log('enter router')
    ctx.data.from = 'patrikhuang';
    await next(); // 执行下一中间件
    console.log('exit router')
  });

  app.router('user', async (ctx, next) => {
    console.log('enter user router')
    ctx.data.name = '小黄',
    ctx.data.role = 'abc',
    await next();
  }, async(ctx) => {
    ctx.data.city = 'Foshan';
    // ctx.body 返回数据到小程序端
    ctx.body = { code: 0, data: ctx.data};
    console.log('exit user router')
  });

  app.router('school', async (ctx, next) => {
    console.log('enter school router')
    ctx.data.name = '小白',
    ctx.data.role = 'abc',
    await next();
  }, async(ctx) => {
    ctx.data.city = 'cba';
    // ctx.body 返回数据到小程序端
    ctx.body = { code: 0, data: ctx.data};
    console.log('exit school router')
  });

  return app.serve();
}

let result = exports.main({
  userInfo: '123456',
  $url: "school"
}, {}).then(res => {
  console.log(res);
});

