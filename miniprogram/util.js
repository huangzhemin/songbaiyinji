const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
const userInfo = db.collection('userInfo')
const taskOperateMsgInfo = db.collection('taskOperateMsgInfo')
const _ = db.command

var debugLog = function (logContent) {
  let debugSwitch = true;
  if (debugSwitch) {
    console.log(logContent);
  }
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

var validStr = function(inputStr) {
  return !(typeof(inputStr) == '' || typeof(inputStr) == 'undefined' || inputStr == undefined || inputStr.length == 0);
}

var validList = function(inputList) {
  return !(typeof(inputList) == [] || inputList == undefined || inputList.length == 0);
}

var convertDatabaseTaskToInnerTask = function (databaseTaskData) {
  // console.log(databaseTaskData);
  let innerTaskData = {
    'taskId': validStr(databaseTaskData['taskId']) ? databaseTaskData['taskId'] : '',
    'openId': validStr(databaseTaskData['openId']) ? databaseTaskData['openId'] : '',
    'status': databaseTaskData['status'] != undefined ? databaseTaskData['status'] : 0,
    'taskTitle': validStr(databaseTaskData['taskTitle']) ? databaseTaskData['taskTitle'] : '',
    'taskPlanDesc': validStr(databaseTaskData['taskPlanDesc']) ? databaseTaskData['taskPlanDesc'] : '',
    'taskPlanUploadMediaList': [],  //这里需要在每次读取的时候，设置初始值，防止undefined影响数组逻辑
    'taskCompleteDesc': validStr(databaseTaskData['taskCompleteDesc']) ? databaseTaskData['taskCompleteDesc'] : '',
    'taskCompleteUploadMediaList': [], //这里需要在每次读取的时候，设置初始值，防止undefined影响数组逻辑
    'taskMediaList': validList(databaseTaskData['taskMediaList']) ? databaseTaskData['taskMediaList'] : [],
    'thumbImg': validStr(databaseTaskData['thumbImg']) ? databaseTaskData['thumbImg'] : '',
    'avatar': validStr(databaseTaskData['avatar']) ? databaseTaskData['avatar'] : '',
    'nickName': validStr(databaseTaskData['nickName']) ? databaseTaskData['nickName'] : '',
    'pubTime': databaseTaskData['pubTime'] != undefined ? databaseTaskData['pubTime'] : 0,
    'supportUserList': validList(databaseTaskData['supportUserList']) ? databaseTaskData['supportUserList'] : [],
    'supportUserAvatarList': validList(databaseTaskData['supportUserAvatarList']) ? databaseTaskData['supportUserAvatarList'] : [],
    'opposeUserList': validList(databaseTaskData['opposeUserList']) ? databaseTaskData['opposeUserList'] : [],
    'opposeUserAvatarList': validList(databaseTaskData['opposeUserAvatarList']) ? databaseTaskData['opposeUserAvatarList'] : [],
  };
  // console.log(innerTaskData);
  return innerTaskData;
}

var batchConvertDatabaseTaskToInnerTask = function (databaseTaskDataList) {
  var innerTaskList = [];
  for (const key in databaseTaskDataList) {
    if (databaseTaskDataList.hasOwnProperty(key)) {
      const element = databaseTaskDataList[key];
      innerTaskList.push(this.convertDatabaseTaskToInnerTask(element));
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
    if (element.match(openId + '_' + taskId + '_plan')) {
      let i = element.charAt(element.search('plan_') + 5);
      //因为只有9张，所以可以采用这种tricky方法
      taskPlanUploadMediaList[i] = element;
    } else if (element.match(openId + '_' + taskId + '_complete')) {
      let i = element.charAt(element.search('complete_') + 9);
      //因为只有9张，所以可以采用这种tricky方法
      taskCompleteUploadMediaList[i] = element;
    }
  }

  return {
    'taskPlan': taskPlanUploadMediaList,
    'taskComplete': taskCompleteUploadMediaList,
  };
}

//更新当前数据库中的用户数据，如果携带openId，则update，未携带add添加
var uploadUserInfoToDatabase = function (event) {
  if (event.openId) {
    //如果数据库中已经有存储，则直接更新数据库
    userInfo.where({
      _openid: event.openId,
    }).update({
      data: event.data,
    }).then(userInfoDatabaseRes => {
      event.success(userInfoDatabaseRes);
    }).catch(err => {
      event.fail(err);
    });
  } else {
    // 如果数据库没有数据，则添加数据
    userInfo.add({
      data: event.data,
    }).then(userInfoDatabaseRes => {
      event.success(userInfoDatabaseRes);
    }).catch(err => {
      event.fail(err);
    })
  }
}

var addTaskToDatabase = function (event) {
  // console.log(event);
  // taskInfo.add({
  //   data: this.convertInnerTaskToDatabaseTask(that.data),
  //   success:(res => {
  //     event.success(res);
  //   })
  // });
}

var updateTaskToDatabase = function () {

}

var getAllTaskList = function (event) {
  taskInfo.orderBy('pubTime', 'desc').get({
    success: (taskInfoRes => {
      console.log(taskInfoRes);
      event.success(taskInfoRes);
    })
  })
}

var getCurrentUserOpenId = function (event) {
  wx.getStorage({
    key: 'openid',
    success: (res => {
      event.success(res.data);
    })
  });
}

var getCurrentUserTaskListWithStatusType = function (event) {
  if (event.openId) {
    taskInfo.where({
      openId: event.openId, //当前用户 openId
      status: (event.type == 'doing' ? _.or(0, 1, 2) : _.or(3, 4))
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
          status: (event.type == 'doing' ? _.or(0, 1, 2) : _.or(3, 4))
        }).skip(event.page * 20).orderBy('pubTime', 'desc').get({
          success: (taskInfoRes => {
            console.log('getCurrentUserDoingTaskList without openId:', taskInfoRes);
            event.success(taskInfoRes)
          })
        })
      })
    });
  }
}

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

//返回用户的openId 及 当前用户的其他信息
var getCurrentUserInfo = function (event) {
  if (event.openId) {
    userInfo.where({
      _openid: event.openId
    }).get({
      success: (userInfoRes => {
        event.success(event.openId, userInfoRes)
      })
    });
  } else {
    wx.getStorage({
      key: 'openid',
      success: (res => {
        userInfo.where({
          _openid: res.data // 填入当前用户 openid
        }).get({
          success: (userInfoRes => {
            event.success(res.data, userInfoRes)
          }),
          fail: (err => {
            event.fail(err);
          }),
        })
      }),
      fail: (err => {
        event.fail(err);
      })
    });
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
  var that = this;
  getCurrentUserInfo({
    success: function (currentUserOpenId, userInfoRes) {
      let operateUserOpenId = currentUserOpenId;
      let operateUserNickName = userInfoRes.data[0].nickName;
      let operateUserAvatarUrl = userInfoRes.data[0].avatarUrl;

      //根据operate 和 taskId taskName生成描述
      var operateDesc = '';
      switch (operationType) {
        case 'create':
          operateDesc = '创建了任务'+'「'+taskTitle+'」';
          break;
        case 'cancel':
          operateDesc = '取消了任务'+'「'+taskTitle+'」';
          break;
        case 'modify':
          operateDesc = '修改了任务'+'「'+taskTitle+'」';
          break;
        case 'giveup':
          operateDesc = '放弃了任务'+'「'+taskTitle+'」';
          break;
        case 'support':
          operateDesc = '支持了任务'+'「'+taskTitle+'」';
          break;
        case 'oppose':
          operateDesc = '反对了任务'+'「'+taskTitle+'」';
          break;
        case 'complete':
          operateDesc = '修改任务'+'「'+taskTitle+'」状态成功';
          break;
        case 'complete':
          operateDesc = '修改任务'+'「'+taskTitle+'」状态失败';;
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

module.exports = {
  debugLog: debugLog,
  convertInnerTaskToDatabaseTask: convertInnerTaskToDatabaseTask,
  convertDatabaseTaskToInnerTask: convertDatabaseTaskToInnerTask,
  batchConvertDatabaseTaskToInnerTask: batchConvertDatabaseTaskToInnerTask,
  getUploadMediaList: getUploadMediaList,
  uploadUserInfoToDatabase: uploadUserInfoToDatabase,
  addTaskToDatabase: addTaskToDatabase,
  getAllTaskList: getAllTaskList,
  getCurrentUserOpenId: getCurrentUserOpenId,
  getCurrentUserTaskListWithStatusType: getCurrentUserTaskListWithStatusType,
  getCurrentUserTaskList: getCurrentUserTaskList,
  getCurrentUserInfo: getCurrentUserInfo,
  addUserOperationMsgWithOperateAndCurrentTaskInfo: addUserOperationMsgWithOperateAndCurrentTaskInfo,
  getCurrentUserMsgList: getCurrentUserMsgList,
  validStr: validStr,
  validList: validList,
}