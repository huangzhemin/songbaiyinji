// miniprogram/pages/userDetail/userDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskList: [
      {
        taskTitle:'这是任务标题任务标题任务标题',
        taskDesc: '这是任务描述这是任务描述这是任务描述这是任务描述',
        status: '0',
        thumbImg: '/images/create-collection.png',
      },
      {
        taskTitle:'这是任务标题任务标题任务标题',
        taskDesc: '这是任务描述这是任务描述这是任务描述这是任务描述',
        status: '1',
        thumbImg: '/images/create-collection.png',
      },
      {
        taskTitle:'这是任务标题任务标题任务标题',
        taskDesc: '这是任务描述这是任务描述这是任务描述这是任务描述',
        status: '3',
        thumbImg: '/images/create-collection.png',
      },
    ],
    userInfo: {
      sdkUserInfo: {
        avatarUrl: 'https://b.yzcdn.cn/vant/icon-demo-1126.png',
        nickName: '小黄',
      },
      customUserInfo: {
        userRanking: '1',
        userPoints: '100',
      },
    }
  },
})