const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
const userInfo = db.collection('userInfo')
const taskOperateMsgInfo = db.collection('taskOperateMsgInfo')
const _ = db.command
// import Toast from '../miniprogram/miniprogram_npm/@vant/weapp/toast/index'

var debugLog = function (logContent) {
  let debugSwitch = true;
  if (debugSwitch) {
    console.log(logContent);
  }
}

//判断字符串有效性
var validStr = function (inputStr) {
  return !(typeof (inputStr) == '' ||
    typeof (inputStr) == 'undefined' ||
    inputStr == undefined ||
    inputStr.length == 0);
}

//判断列表有效性
var validList = function (inputList) {
  return !(typeof (inputList) == [] ||
    inputList == undefined ||
    inputList.length == 0);
}

//判断字典有效性
var validDic = function (inputDic) {
  return !(typeof (inputDic) == {} ||
    inputDic == undefined ||
    Object.keys(inputDic).length == 0);
}

//转换内部任务数据 到 数据库写入任务数据，方便数据传输
//私有方法：生成taskMediaThumbList
var p_mediaThumbListWithInnerTaskData = function (innerTaskData) {
  let taskMediaList = innerTaskData['taskMediaList'];
  let taskMediaAndThumbDic = innerTaskData['taskMediaAndThumbDic'];
  var taskMediaThumbList = [];
  for (const key in taskMediaList) {
    const element = taskMediaList[key];
    taskMediaThumbList.push(taskMediaAndThumbDic[element]);
  }
  return taskMediaThumbList;
}

var convertInnerTaskToDatabaseTask = function (innerTaskData) {
  // console.log('convertInnerTaskToDatabaseTask start', innerTaskData);
  let databaseTaskData = {
    'taskId': innerTaskData['taskId'],
    'openId': innerTaskData['openId'],
    'status': innerTaskData['status'],
    'taskTitle': innerTaskData['taskTitle'],
    'taskPlanDesc': innerTaskData['taskPlanDesc'], //innerTaskData['taskPlan']['taskDesc'],
    'taskCompleteDesc': innerTaskData['taskCompleteDesc'], //innerTaskData['taskComplete']['taskDesc'],
    'taskMediaList': innerTaskData['taskMediaList'],
    'taskMediaThumbList': p_mediaThumbListWithInnerTaskData(innerTaskData),
    'thumbImg': innerTaskData['thumbImg'],
    'avatar': innerTaskData['avatar'],
    'nickName': innerTaskData['nickName'],
    'pubTime': innerTaskData['pubTime'],
    'supportUserList': innerTaskData['supportUserList'],
    'supportUserAvatarList': innerTaskData['supportUserAvatarList'],
    'opposeUserList': innerTaskData['opposeUserList'],
    'opposeUserAvatarList': innerTaskData['opposeUserAvatarList'],
  };
  // console.log('convertInnerTaskToDatabaseTask end', databaseTaskData);
  return databaseTaskData;
}

//将数据库的任务数据，转换为小程序内部任务数据（单个taskItem）
//私有方法：生成taskMediaAndThumbDic
var p_mediaAndThumbDicWithDatabaseTaskData = function (databaseTaskData) {
  let taskMediaList = validList(databaseTaskData['taskMediaList']) ? databaseTaskData['taskMediaList'] : [];
  let taskMediaThumbList = validList(databaseTaskData['taskMediaThumbList']) ? databaseTaskData['taskMediaThumbList'] : [];
  var taskMediaAndThumbDic = {};
  for (const key in taskMediaList) {
    const taskMedia = taskMediaList[key];
    const taskMediaThumb = validList(taskMediaThumbList) ? taskMediaThumbList[key] : taskMedia;
    taskMediaAndThumbDic[taskMedia] = taskMediaThumb;
  }
  return taskMediaAndThumbDic;
}

var convertDatabaseTaskToInnerTask = function (databaseTaskData) {
  // console.log('convertDatabaseTaskToInnerTask start', databaseTaskData);
  let innerTaskData = {
    'taskId': validStr(databaseTaskData['taskId']) ? databaseTaskData['taskId'] : '',
    'openId': validStr(databaseTaskData['openId']) ? databaseTaskData['openId'] : '',
    'status': databaseTaskData['status'] != undefined ? databaseTaskData['status'] : 0,
    'taskTitle': validStr(databaseTaskData['taskTitle']) ? databaseTaskData['taskTitle'] : '',
    'taskPlanDesc': validStr(databaseTaskData['taskPlanDesc']) ? databaseTaskData['taskPlanDesc'] : '',
    'taskPlanUploadMediaList': [], //这里需要在每次读取的时候，设置初始值，防止undefined影响数组逻辑
    'taskCompleteDesc': validStr(databaseTaskData['taskCompleteDesc']) ? databaseTaskData['taskCompleteDesc'] : '',
    'taskCompleteUploadMediaList': [], //这里需要在每次读取的时候，设置初始值，防止undefined影响数组逻辑
    'taskMediaList': validList(databaseTaskData['taskMediaList']) ? databaseTaskData['taskMediaList'] : [],
    'taskMediaAndThumbDic': p_mediaAndThumbDicWithDatabaseTaskData(databaseTaskData),
    'taskMediaAndMediaFileIdDic': {},
    'thumbImg': validStr(databaseTaskData['thumbImg']) ? databaseTaskData['thumbImg'] : '',
    'avatar': validStr(databaseTaskData['avatar']) ? databaseTaskData['avatar'] : '',
    'nickName': validStr(databaseTaskData['nickName']) ? databaseTaskData['nickName'] : '',
    'pubTime': databaseTaskData['pubTime'] != undefined ? databaseTaskData['pubTime'] : 0,
    'supportUserList': validList(databaseTaskData['supportUserList']) ? databaseTaskData['supportUserList'] : [],
    'supportUserAvatarList': validList(databaseTaskData['supportUserAvatarList']) ? databaseTaskData['supportUserAvatarList'] : [],
    'opposeUserList': validList(databaseTaskData['opposeUserList']) ? databaseTaskData['opposeUserList'] : [],
    'opposeUserAvatarList': validList(databaseTaskData['opposeUserAvatarList']) ? databaseTaskData['opposeUserAvatarList'] : [],
  };
  // console.log('convertDatabaseTaskToInnerTask end', innerTaskData);
  return innerTaskData;
}

//批量转换数据库任务数据 到 内部任务数据
var batchConvertDatabaseTaskToInnerTask = function (databaseTaskDataList) {
  var innerTaskList = [];
  for (const key in databaseTaskDataList) {
    if (databaseTaskDataList.hasOwnProperty(key)) {
      const element = databaseTaskDataList[key];
      innerTaskList.push(convertDatabaseTaskToInnerTask(element));
    }
  }
  return innerTaskList;
}

//该方法，传入taskMediaList，标识数据库媒体列表
//将处理并且排序后的 plan和complete两个list打包返回
var getUploadMediaList = function (openId, taskId, taskMediaList) {
  let taskPlanUploadMediaList = [];
  let taskCompleteUploadMediaList = [];
  for (let index = 0; index < taskMediaList.length; index++) {
    const element = taskMediaList[index];
    //匹配字符串，定位
    //本来就是顺序的，那就按照顺序来，未来移动图片后，依然还是顺序，与图片初始所带index无关
    if (element.match(openId + '_' + taskId + '_plan')) {
      taskPlanUploadMediaList.push(element);
    } else if (element.match(openId + '_' + taskId + '_complete')) {
      taskCompleteUploadMediaList.push(element);
    }
  }

  return {
    'taskPlan': taskPlanUploadMediaList,
    'taskComplete': taskCompleteUploadMediaList,
  };
}

//更新当前数据库中的用户数据，如果携带openId，则update，未携带add添加
var p_uploadUserInfoToDatabase = function (event) {
  console.log('p_uploadUserInfoToDatabase', event);
  if (event.openId) {
    //如果数据库中已经有存储，则直接更新数据库
    userInfo.where({
      _openid: event.openId,
    }).update({
      data: event.data,
    }).then(userInfoDatabaseRes => {
      console.log('p_uploadUserInfoToDatabase update', userInfoDatabaseRes);
      event.success(userInfoDatabaseRes);
    }).catch(err => {
      event.fail(err);
    });
  } else {
    // 如果数据库没有数据，则添加数据
    userInfo.add({
      data: event.data,
    }).then(userInfoDatabaseRes => {
      console.log('p_uploadUserInfoToDatabase add', userInfoDatabaseRes);
      event.success(userInfoDatabaseRes);
    }).catch(err => {
      event.fail(err);
    })
  }
}

//拉取所有的任务列表
var getAllTaskList = function (event) {
  taskInfo.orderBy('pubTime', 'desc').get({
    success: (taskInfoRes => {
      console.log(taskInfoRes);
      event.success(taskInfoRes);
    })
  })
}

//拉取全量 正在进行中/已结束 任务列表
var getTaskListWithStatusType = function (event) {
  console.log('getTaskListWithStatusType event', event);
  taskInfo.where({
    status: p_getStatusCondition(event.type)
  }).orderBy('pubTime', 'desc').get({
    success: (taskInfoRes => {
      console.log(taskInfoRes);
      event.success(taskInfoRes);
    })
  })
}

//拉取下一屏 正在进行中/已结束 任务列表
var getNextPageTaskListWithCurrentStatus = function (event) {

  let currentLoadTaskList = event.currentTaskList;
  let taskNumOnePage = event.taskNumOnePage > 0 ? event.taskNumOnePage : 10;
  var currentLoadTaskListLastTaskPubTime;
  if (validList(currentLoadTaskList)) {
    currentLoadTaskListLastTaskPubTime = currentLoadTaskList[currentLoadTaskList.length - 1].pubTime;
  } else {
    currentLoadTaskListLastTaskPubTime = Date.parse(new Date()) / 1000;
  }
  console.log('taskNumOnePage currentLoadTaskList currentLoadTaskListLastTaskPubTime', taskNumOnePage, currentLoadTaskList, currentLoadTaskListLastTaskPubTime);
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: 'tcbDatabase',
    // 传递给云函数的参数
    data: {
      $url: "getNextPageTaskListWithCurrentStatus",
      taskNumOnePage: taskNumOnePage,
      taskListType: event.type,
      lastPubTime: currentLoadTaskListLastTaskPubTime,
    }
  }).then(res => {
    //这里层级结构，需要注意
    event.success(res.result.data.data);
  }).catch(err => {
    console.error(err);
    event.fail(err);
  });
}

//获取当前用户的openId
var getCurrentUserOpenId = function (event) {
  wx.getStorage({
    key: 'openid',
    success: (res => {
      console.log('getCurrentUserOpenId openId', res.data);
      event.success(res.data);
    }),
    fail: (err => {
      console.log('getCurrentUserOpenId openId failed', err);
      event.fail('');
    })
  });
}

//获取当前用户新创建任务的 taskId，通过拉取当前用户数据库最后一条taskId，推测下一条taskId
var getCurrentUserNewTaskId = function (event) {
  if (event.openId) {
    taskInfo.where({
      openId: event.openId // 填入当前用户 openid
    }).orderBy('pubTime', 'desc').limit(1).get({
      success: (taskInfoRes => {
        console.log('getCurrentUserTaskList with openId:', taskInfoRes);
        event.success(p_generateNewTaskIdWithOldTaskList(taskInfoRes.data));
      })
    })
  } else {
    wx.getStorage({
      key: 'openid',
      success: (res => {
        taskInfo.where({
          openId: res.data // 填入当前用户 openid
        }).orderBy('pubTime', 'desc').limit(1).get({
          success: (taskInfoRes => {
            console.log('getCurrentUserTaskList without openId:', taskInfoRes);
            event.success(p_generateNewTaskIdWithOldTaskList(taskInfoRes.data));
          })
        })
      })
    })
  }
}

var p_generateNewTaskIdWithOldTaskList = function (oldTaskList) {
  var newTaskId = 'task0';
  if (validList(oldTaskList)) {
    //如果数组不为空，则直接向后计算
    let latestTaskId = oldTaskList[0]['taskId'];
    newTaskId = 'task' + (+latestTaskId.substring(4, latestTaskId.length) + 1);
  }
  // console.log(newTaskId);
  return newTaskId;
}

//根据当前的状态类型(doing/complete)，获取当前用户的任务列表
var getCurrentUserTaskListWithStatusType = function (event) {
  if (event.openId) {
    taskInfo.where({
      openId: event.openId, //当前用户 openId
      status: p_getStatusCondition(event.type)
    }).skip(event.page * 20).orderBy('pubTime', 'desc').get({
      success: (taskInfoRes => {
        console.log('getCurrentUserDoingTaskList with openId:', taskInfoRes);
        event.success(taskInfoRes)
      })
    })
  } else {
    wx.getStorage({
      key: 'openid',
      success: (res => {
        taskInfo.where({
          openId: res.data, // 填入当前用户 openid
          status: p_getStatusCondition(event.type)
        }).skip(event.page * 20).orderBy('pubTime', 'desc').get({
          success: (taskInfoRes => {
            console.log('getCurrentUserDoingTaskList without openId:', event, taskInfoRes);
            event.success(taskInfoRes)
          })
        })
      })
    });
  }
}

//获取当前用户的下一刷任务列表
//1.有传入openId，则直接查找
//2.如果未传入openId，则需先查找openId，再查找用户任务列表
//3.传入现有的任务列表
var getUserDetailNextPageTaskListWithCurrentStatus = function (event) {
  let currentUserDetailLoadTaskList = event.currentUserDetailTaskList;
  let taskNumOnePage = event.taskNumOnePage > 0 ? event.taskNumOnePage : 10;
  let taskListType = validStr(event.taskListType) ? event.taskListType : 'all';
  var currentUserDetailLoadTaskListLastTaskPubTime;
  if (validList(currentUserDetailLoadTaskList)) {
    currentUserDetailLoadTaskListLastTaskPubTime = currentUserDetailLoadTaskList[currentUserDetailLoadTaskList.length - 1].pubTime;
  } else {
    currentUserDetailLoadTaskListLastTaskPubTime = Date.parse(new Date()) / 1000;
  }
  console.log('taskNumOnePage taskListType currentUserDetailLoadTaskList currentUserDetailLoadTaskListLastTaskPubTime', taskNumOnePage, taskListType, currentUserDetailLoadTaskList, currentUserDetailLoadTaskListLastTaskPubTime);

  if (validStr(event.openId)) {
    console.log('getUserDetailNextPageTaskListWithCurrentStatus has openId', event.openId);
    p_getUserDetailNextPageTaskListWithCurrentStatus({
      openId: event.openId,
      taskNumOnePage: taskNumOnePage,
      taskListType: taskListType,
      lastPubTime: currentUserDetailLoadTaskListLastTaskPubTime,
      success: event.success,
    });
  } else {
    console.log('getUserDetailNextPageTaskListWithCurrentStatus has not openId', event.openId);
    wx.getStorage({
      key: 'openid',
      success: (res => {
        p_getUserDetailNextPageTaskListWithCurrentStatus({
          openId: res.data,
          taskNumOnePage: taskNumOnePage,
          taskListType: taskListType,
          lastPubTime: currentUserDetailLoadTaskListLastTaskPubTime,
          success: event.success,
        });
      })
    });
  }
}

var p_getUserDetailNextPageTaskListWithCurrentStatus = function (event) {
  console.log('p_getUserDetailNextPageTaskListWithCurrentStatus invoked');
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: 'tcbDatabase',
    // 传递给云函数的参数
    data: {
      $url: "getUserNextPageTaskListWithCurrentStatus",
      openId: event.openId,
      taskNumOnePage: event.taskNumOnePage,
      taskListType: event.taskListType,
      lastPubTime: event.lastPubTime,
    }
  }).then(res => {
    //这里层级结构，需要注意
    event.success(res.result.data.data);
  }).catch(err => {
    console.error(err);
    event.fail(err);
  });
}

//获取当前用户的任务列表，
//1.有传入openId，则直接查找
//2.如果未传入openId，则需先查找openId，再查找用户任务列表
var getCurrentUserTaskList = function (event) {
  if (event.openId) {
    taskInfo.where({
      openId: event.openId // 填入当前用户 openid
    }).skip(event.page * 20).orderBy('pubTime', 'desc').get({
      success: (taskInfoRes => {
        console.log('getCurrentUserTaskList with openId:', taskInfoRes);
        event.success(taskInfoRes)
      })
    })
  } else {
    wx.getStorage({
      key: 'openid',
      success: (res => {
        taskInfo.where({
          openId: res.data // 填入当前用户 openid
        }).skip(event.page * 20).orderBy('pubTime', 'desc').get({
          success: (taskInfoRes => {
            console.log('getCurrentUserTaskList without openId:', taskInfoRes);
            event.success(taskInfoRes)
          })
        })
      })
    });
  }
}

//判断用户是否登录
var isLogin = function (event) {
  getCurrentUserOpenId({
    success: function (openId) {
      event.success(true);
    },
    fail: function (openId) {
      console.log('isLogout', openId)
      if (!validStr(openId)) {
        event.success(false);
      }
    }
  });
}

//通过openId获取当前的用户信息
var p_getCurrentUserInfoWithOpenId = function (event) {
  console.log('p_getCurrentUserInfoWithOpenId openId', event.openId)
  userInfo.where({
    _openid: event.openId
  }).get({
    success: (userInfoRes => {
      console.log('p_getCurrentUserInfoWithOpenId', userInfoRes);
      event.success(event.openId, userInfoRes)
    }),
    fail: (err => {
      event.fail(err);
    })
  });
}

//获取登录用户的 用户信息
var p_getCurrentUserInfoLogined = function (event) {
  if (event.openId) {
    p_getCurrentUserInfoWithOpenId(event);
  } else {
    wx.getStorage({
      key: 'openid',
      success: (res => {
        p_getCurrentUserInfoWithOpenId({
          openId: res.data, // 填入当前用户 openid
          success: event.success,
          fail: event.fail,
        });
      }),
      fail: (err => {
        event.fail(err);
      })
    });
  }
}

//返回用户的openId 及 当前用户的其他信息
//如果用户登录正常返回
//如果用户没有登录，直接返回空
//在调用getCurrentUserInfo的地方，通过判断返回结果，来调整
var getCurrentUserInfo = function (event) {
  if (validStr(event.openId)) {
    console.log('getCurrentUserInfo', event);
    p_getCurrentUserInfoWithOpenId(event);
  } else {
    console.log('getCurrentUserInfo 2', event);
    isLogin({
      success: function (logined) {
        if (logined) {
          console.log('getCurrentUserInfo logined');
          p_getCurrentUserInfoLogined(event)
        } else {
          console.log('getCurrentUserInfo logout');
          event.fail('user logout');
        }
      },
    })
  }
}

//将任务信息处理信息更新至消息数据库
// 二次抽离
// 其他用户 点击投票（支持、反对）时，在任务数据 更新 任务数据库的同时，触发消息信息生成，并写入消息数据库
// 志愿决策 点击决策（完成、失败）时，在任务数据 更新 任务数据库的同时，触发消息信息生成，并写入消息数据
// 当前用户 点击行为（创建、修改、放弃）时，在任务数据 创建 更新 任务数据库的同时，触发消息信息生成，并写入消息数据库

// 传入数据
// 1.具体操作行为 operate (String)
// 方法内部自动获取当前任务信息、操作者的信息，当前操作时间，进行数据拼装
var addUserOperationMsgWithOperateAndCurrentTaskInfo = function (userOperationMsg) {
  let taskId = userOperationMsg.taskInfo.taskId;
  let taskTitle = userOperationMsg.taskInfo.taskTitle;
  let taskUserOpenId = userOperationMsg.taskInfo.openId;
  let taskUserNickName = userOperationMsg.taskInfo.nickName;
  let operationType = userOperationMsg.operationType;
  let operateTime = Date.parse(new Date()) / 1000;
  //获取当前用户信息
  let that = this;
  getCurrentUserInfo({
    success: function (currentUserOpenId, userInfoRes) {
      let operateUserOpenId = currentUserOpenId;
      let operateUserNickName = userInfoRes.data[0].nickName;
      let operateUserAvatarUrl = userInfoRes.data[0].avatarUrl;

      //根据operate 和 taskId taskName生成描述
      var operateDesc = '';
      switch (operationType) {
        case 'create':
          operateDesc = '创建了任务' + '「' + taskTitle + '」';
          break;
        case 'cancel':
          operateDesc = '取消了任务' + '「' + taskTitle + '」';
          break;
        case 'modify':
          operateDesc = '修改了任务' + '「' + taskTitle + '」';
          break;
        case 'giveup':
          operateDesc = '放弃了任务' + '「' + taskTitle + '」';
          break;
        case 'support':
          operateDesc = '支持了任务' + '「' + taskTitle + '」';
          break;
        case 'oppose':
          operateDesc = '反对了任务' + '「' + taskTitle + '」';
          break;
        case 'complete':
          operateDesc = '修改任务' + '「' + taskTitle + '」状态成功';
          break;
        case 'complete':
          operateDesc = '修改任务' + '「' + taskTitle + '」状态失败';;
          break;
        default:
          break;
      }

      p_addUserOperationMsgToDatabase({
        taskId: taskId,
        taskTitle: taskTitle,
        taskUserInfo: {
          openId: taskUserOpenId,
          nickName: taskUserNickName,
        },
        operateUserInfo: {
          openId: operateUserOpenId,
          nickName: operateUserNickName,
          avatarUrl: operateUserAvatarUrl,
        },
        operateInfo: {
          operationType: operationType,
          operateTime: operateTime,
          operateDesc: operateDesc,
        },
      });
    },
  })
}


// taskOperateMsgInfo
// 将任务操作信息更新至数据库
// 其他用户 点击投票（支持、反对）时，在任务数据 更新 任务数据库的同时，触发消息信息生成，并写入消息数据库
// 志愿决策 点击决策（完成、失败）时，在任务数据 更新 任务数据库的同时，触发消息信息生成，并写入消息数据
// 当前用户 点击行为（创建、修改、放弃）时，在任务数据 创建 更新 任务数据库的同时，触发消息信息生成，并写入消息数据库

// 行为类似，抽离为公共方法，传入参数：
// 1.当前任务id taskId
// 2.任务计划者 taskUserInfo
//     2.1 id openId
//     2.2 昵称 nickName   
// 3.当前行为发起者 operateUserInfo
//     3.1 id openId
//     3.2 昵称 nickName
//     3.3 头像 avatarUrl
// 4.行为数据 operateInfo
//     4.1 具体行为 operate (String)
//     4.2 行为发起时间 operateTime (timestamp)
var p_addUserOperationMsgToDatabase = function (userOperationMsg) {
  console.log('userOperationMsg', userOperationMsg)
  taskOperateMsgInfo.add({
    data: userOperationMsg,
  });
}

//返回当前用户的消息记录
var getCurrentUserMsgList = function (event) {
  if (event.openId) {
    taskOperateMsgInfo.where({
      taskUserInfo: {
        openId: event.openId, // 填入当前用户 openid
      }
    }).orderBy('operateInfo.operateTime', 'desc').get({
      success: (msgListRes => {
        event.success(msgListRes.data)
      })
    });
  } else {
    wx.getStorage({
      key: 'openid',
      success: (res => {
        userInfo.where({
          _openid: res.data, // 填入当前用户 openid
        }).get({
          success: (userInfoRes => {
            taskOperateMsgInfo.where({
              taskUserInfo: {
                openId: res.data, // 填入当前用户 openid
              }
            }).orderBy('operateInfo.operateTime', 'desc').get({
              success: (msgListRes => {
                event.success(msgListRes.data)
              })
            });
          })
        })
      })
    });
  }
}

//外部调用方法，拉起用户登录，并获取用户的个人信息
var userLoginAndGetUserInfo = function (event) {
  console.log('userLoginAndGetUserInfo', event);
  //获取用户的授权情况
  wx.getSetting({
    withSubscriptions: true,
    success: (result) => {
      wx.showLoading({
        title: '登录中..',
      })
      //此处需要判断是否已经获取到用户登录权限
      //userInfo只能在userLoginAndGetUserInfo中输出
      if (result.authSetting['scope.userInfo']) {
        console.log('user has Authorize and login');
        userHasAuthorize(event);
      } else {
        console.log('user no Authorize');
        getUserAuthorize(event);
      }
    }
  })
}

// 微信已经授权过
var userHasAuthorize = function (event) {
  //此时已授权，则拉取用户的登录数据，检查是否需要 写入或者更新数据库
  console.log('userHasAuthorize', event);
  p_getOpenIdFromCloudAndWriteLocalStorage({
    success: function (openId) {
      console.log('userHasAuthorize success', event);
      event.userInfo['openId'] = openId;
      getUserAuth(openId, event);
    },
  });
}

// 微信未授权，需要先获取授权（userInfo），再登录当前用户信息
// 这里后续需要增加更多的授权能力
var getUserAuthorize = function (event) {
  //此时未授权，需要询问用户获取授权
  wx.authorize({
    scope: 'scope.userInfo',
  }).then(res => {
    //此时成功授权
    console.log('authorize success');
    //授权成功后第一步操作，使用云函数，请求用户对应的openId，该openId是用户的唯一标记
    p_getOpenIdFromCloudAndWriteLocalStorage({
      success: function (openId) {
        getUserAuth(openId);
      },
    });
  }).catch(err => {
    //授权失败
    console.error(err);
    //此处没有必要跳转到授权页，直接弹出弹窗即可
    wx.showToast({
      title: '需要登录才可查看',
      icon: 'fail',
      duration: 2000
    })
  })
}

// 获取用户的登录信息
// 目前只有 自己存储的 用户信息
// 后续需要添加 登录票据
var getUserAuth = function (openId, event) {
  //此处判断用户是否在数据库中，如果在的话，则直接读取，不在的话，则需要写入
  console.log('getUserAuth', openId, event);
  getCurrentUserInfo({
    openId: openId,
    success: function (currentOpenId, remoteUserInfo) {
      console.log('getUserAuth getCurrentUserInfo', currentOpenId, remoteUserInfo, event);
      //因为本地无更新用户数据的功能，所以本地只有可能是创建用户
      //因为登录这里比较特殊，如果返回数据，则说明数据库已经有用户数据，可以直接返回
      //如果没有用户数据，则认为是新用户，直接添加即可
      if (validList(remoteUserInfo.data)) {
        //userInfo数据库中已经有数据存储
        event.success(currentOpenId, remoteUserInfo.data[0]);
        //隐藏loadingView
        wx.hideLoading();
      } else {
        //userInfo数据库中 无该用户，需要将用户数据，添加到数据库中
        p_uploadUserInfoToDatabase({
          openId: remoteUserInfo.data.length > 0 ? currentOpenId : '',
          data: event.userInfo,
          success: function (userInfoDatabaseRes) {
            console.log('getUserAuth return', event, currentOpenId, remoteUserInfo, userInfoDatabaseRes)
            event.success(currentOpenId, event.userInfo);
            //隐藏loadingView
            wx.hideLoading();
          },
          fail: function (err) {
            console.log('getUserAuth error', err);
            console.error(err)
            //隐藏loadingView
            wx.hideLoading();
          }
        });
      }
    }
  });
}

var showToast = function (event) {
  if (event.type == 'text') {
    Toast(event.content);
  }
}

//////////////private method////////////////
// 将从云端拉取的用户OpenId，写入本地磁盘，方便后续使用
var p_getOpenIdFromCloudAndWriteLocalStorage = function (event) {
  console.log('p_getOpenIdFromCloudAndWriteLocalStorage', event);
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: "login",
  }).then(loginRes => {
    console.log('p_getOpenIdFromCloudAndWriteLocalStorage loginRes', loginRes);
    //这里当前js持有一份
    let currentOpenId = loginRes['result']['openid'];
    //写入到磁盘一份，方便下次启动时读取
    wx.setStorage({
      key: 'openid',
      data: currentOpenId,
    })
    event.success(currentOpenId);
  });
}

// 返回当前任务状态的判断，type = (all/doing/complete)
var p_getStatusCondition = function (type) {
  if (type == 'all') {
    return _.in([0, 1, 2, 3, 4]);
  } else if (type == 'doing') {
    return _.in([0, 1, 2]);
  } else {
    return _.in([3, 4]);
  }
}

var getCurrentStatusTypeWithStatus = function (status) {
  if (status == 0 || status == 1 || status == 2) {
    return 'doing';
  } else if (status = 3 || status == 4) {
    return 'complete';
  }
  return 'other';
}

module.exports = {
  debugLog: debugLog,
  convertInnerTaskToDatabaseTask: convertInnerTaskToDatabaseTask,
  convertDatabaseTaskToInnerTask: convertDatabaseTaskToInnerTask,
  batchConvertDatabaseTaskToInnerTask: batchConvertDatabaseTaskToInnerTask,
  getUploadMediaList: getUploadMediaList,
  getAllTaskList: getAllTaskList,
  getTaskListWithStatusType: getTaskListWithStatusType,
  getNextPageTaskListWithCurrentStatus: getNextPageTaskListWithCurrentStatus,
  getUserDetailNextPageTaskListWithCurrentStatus: getUserDetailNextPageTaskListWithCurrentStatus,
  getCurrentUserOpenId: getCurrentUserOpenId,
  getCurrentUserTaskListWithStatusType: getCurrentUserTaskListWithStatusType,
  getCurrentUserTaskList: getCurrentUserTaskList,
  getCurrentUserNewTaskId: getCurrentUserNewTaskId,
  getCurrentUserInfo: getCurrentUserInfo,
  addUserOperationMsgWithOperateAndCurrentTaskInfo: addUserOperationMsgWithOperateAndCurrentTaskInfo,
  getCurrentUserMsgList: getCurrentUserMsgList,
  validStr: validStr,
  validList: validList,
  validDic: validDic,
  userLoginAndGetUserInfo: userLoginAndGetUserInfo,
  isLogin: isLogin,
  showToast: showToast,
  getCurrentStatusTypeWithStatus: getCurrentStatusTypeWithStatus,
}