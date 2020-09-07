const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
const userInfo = db.collection('userInfo')
const _ = db.command

var debugLog = function(logContent) {
  let debugSwitch = true;
  if (debugSwitch) {
    console.log(logContent);
  }
}

var convertInnerTaskToDatabaseTask = function(innerTaskData) {
  // console.log('convertInnerTaskToDatabaseTask start', innerTaskData);
  let databaseTaskData = {
    'taskId': innerTaskData['taskId'],
    'openId': innerTaskData['openId'],
    'status': innerTaskData['status'],
    'taskTitle': innerTaskData['taskTitle'],
    'taskPlanDesc': innerTaskData['taskPlan']['taskDesc'],
    'taskCompleteDesc': innerTaskData['taskComplete']['taskDesc'],
    'taskMediaList': innerTaskData['taskMediaList'],
    'thumbImg': innerTaskData['thumbImg'],
    'avatar': innerTaskData['avatar'],
    'nickName': innerTaskData['nickName'],
    'pubTime': innerTaskData['pubTime'],
    'supportUserList': innerTaskData['supportUserList'],
    'opposeUserList': innerTaskData['opposeUserList'],
    'canJudge': innerTaskData['canJudge'],
  };
  // console.log('convertInnerTaskToDatabaseTask end', databaseTaskData);
  return databaseTaskData;
}

var convertDatabaseTaskToInnerTask = function(databaseTaskData) {
  // console.log(databaseTaskData);
  let innerTaskData = {
    'taskId': (databaseTaskData['taskId'] ? databaseTaskData['taskId'] : ""),
    'openId': (databaseTaskData['openId'] ? databaseTaskData['openId'] : ""),
    'status': (databaseTaskData['status'] ? databaseTaskData['status'] : 0),
    'taskTitle': (databaseTaskData['taskTitle'] ? databaseTaskData['taskTitle'] : ""),
    'taskPlan': {
      'taskDesc': (databaseTaskData['taskPlanDesc'] ? databaseTaskData['taskPlanDesc'] : ""),
    },
    'taskComplete': {
      'taskDesc': (databaseTaskData['taskCompleteDesc'] ? databaseTaskData['taskCompleteDesc'] : ""),
    },
    'taskMediaList': (databaseTaskData['taskMediaList'] ? databaseTaskData['taskMediaList'] : []),
    'thumbImg': (databaseTaskData['thumbImg'] ? databaseTaskData['thumbImg'] : ""),
    'avatar': (databaseTaskData['avatar'] ? databaseTaskData['avatar'] : ""),
    'nickName': (databaseTaskData['nickName'] ? databaseTaskData['nickName'] : ""),
    'pubTime': (databaseTaskData['pubTime'] ? databaseTaskData['pubTime'] : 0),
    'supportUserList': (databaseTaskData['supportUserList'] ? databaseTaskData['supportUserList'] : []),
    'opposeUserList': (databaseTaskData['opposeUserList'] ? databaseTaskData['opposeUserList'] : []),
    'canJudge': databaseTaskData['canJudge'],
  };
  // console.log(innerTaskData);
  return innerTaskData;
}

var batchConvertDatabaseTaskToInnerTask = function(databaseTaskDataList) {
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
var getUploadMediaList = function(openId, taskId, taskMediaList) {
  let taskPlanUploadMediaList = [];
  let taskCompleteUploadMediaList = [];
  for (let index = 0; index < taskMediaList.length; index++) {
    const element = taskMediaList[index];
    //匹配字符串，定位
    if (element.match(openId+'_'+taskId+'_plan')) {
      let i = element.charAt(element.search('plan_')+5);
      //因为只有9张，所以可以采用这种tricky方法
      taskPlanUploadMediaList[i] = element;
    } else if (element.match(openId+'_'+taskId+'_complete')) {
      let i = element.charAt(element.search('complete_')+9);
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
var uploadUserInfoToDatabase = function(event) {
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
    }).then( userInfoDatabaseRes => {
      event.success(userInfoDatabaseRes);
    }).catch(err => {
      event.fail(err);
    })
  }
}

var addTaskToDatabase = function(event) {
  // console.log(event);
  // taskInfo.add({
  //   data: this.convertInnerTaskToDatabaseTask(that.data),
  //   success:(res => {
  //     event.success(res);
  //   })
  // });
}

var updateTaskToDatabase = function() {
  
}

var getAllTaskList = function(event) {
  taskInfo.orderBy('pubTime', 'desc').get({
    success:(taskInfoRes => {
      event.success(taskInfoRes);
    })
  })
}

var getCurrentUserOpenId = function(event) {
  wx.getStorage({
    key: 'openid',
    success: (res => {
      event.success(res.data);
    })
  });
}

var getCurrentUserTaskListWithStatusType = function(event) {
  if (event.openId) {
    taskInfo.where({
      openId: event.openId,  //当前用户 openId
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

var getCurrentUserTaskList = function(event) {
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
var getCurrentUserInfo = function(event) {
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

module.exports={
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
}