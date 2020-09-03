const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
const userInfo = db.collection('userInfo')

var convertInnerTaskToDatabaseTask = function(innerTaskData) {
  // console.log(innerTaskData);
  let databaseTaskData = {
    'taskId': innerTaskData['taskId'],
    'status': innerTaskData['status'],
    'taskTitle': innerTaskData['taskTitle'],
    'taskPlanDesc': innerTaskData['taskPlan']['taskDesc'],
    'taskCompleteDesc': innerTaskData['taskComplete']['taskDesc'],
    'taskMediaList': innerTaskData['taskMediaList'],
    'thumbImg': innerTaskData['thumbImg'],
    'openId': innerTaskData['openId'],
    'avatar': innerTaskData['avatar'],
    'nickName': innerTaskData['nickName'],
    'pubTime': innerTaskData['pubTime'],
  };
  console.log(databaseTaskData);
  return databaseTaskData;
}

var convertDatabaseTaskToInnerTask = function(databaseTaskData) {
  // console.log(databaseTaskData);
  let innerTaskData = {
    'taskId': databaseTaskData['taskId'],
    'status': databaseTaskData['status'],
    'taskTitle': databaseTaskData['taskTitle'],
    'taskPlan': {
      'taskDesc': databaseTaskData['taskPlanDesc'],
    },
    'taskComplete': {
      'taskDesc': databaseTaskData['taskCompleteDesc'],
    },
    'taskMediaList': databaseTaskData['taskMediaList'],
    'thumbImg': databaseTaskData['thumbImg'],
    'openId': databaseTaskData['openId'],
    'avatar': databaseTaskData['avatar'],
    'nickName': databaseTaskData['nickName'],
    'pubTime': databaseTaskData['pubTime'],
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
var getUploadMediaList = function(taskMediaList) {
  let taskPlanUploadMediaList = [];
  let taskCompleteUploadMediaList = [];
  for (let index = 0; index < taskMediaList.length; index++) {
    const element = taskMediaList[index];
    //warning 此处需要带入真实的用户openid 和 taskid，标记一下
    //匹配字符串，定位
    if (element.match('openid_taskid_plan')) {
      let i = element.charAt(element.search('plan_')+5);
      //因为只有9张，所以可以采用这种tricky方法
      taskPlanUploadMediaList[i] = element;
    } else if (element.match('openid_taskid_complete')) {
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

var addTaskToDatabase = function(event) {
  console.log(event);
  // taskInfo.add({
  //   data: this.convertInnerTaskToDatabaseTask(that.data),
  //   success:(res => {
  //     event.success(res);
  //   })
  // });
}

var getAllTaskList = function(event) {
  taskInfo.get({
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

var getCurrentUserTaskList = function(event) {
  if (event.openId) {
    taskInfo.where({
      openId: event.openId // 填入当前用户 openid
    }).get({
      success: (taskInfoRes => {
        event.success(taskInfoRes)
      })
    })
  } else {
    wx.getStorage({
      key: 'openid',
      success: (res => {
        taskInfo.where({
          openId: res.data // 填入当前用户 openid
        }).get({
          success: (taskInfoRes => {
            event.success(taskInfoRes)
          })
        })
      })
    });
  }
}

//返回用户的openId 及 当前用户的其他信息
var getCurrentUserInfo = function(event) {
  wx.getStorage({
    key: 'openid',
    success: (res => {
      userInfo.where({
        _openid: res.data // 填入当前用户 openid
      }).get({
        success: (userInfoRes => {
          event.success(res.data, userInfoRes)
        })
      })
    })
  });
}

module.exports={
  convertInnerTaskToDatabaseTask: convertInnerTaskToDatabaseTask,
  convertDatabaseTaskToInnerTask: convertDatabaseTaskToInnerTask,
  batchConvertDatabaseTaskToInnerTask: batchConvertDatabaseTaskToInnerTask,
  getUploadMediaList: getUploadMediaList,
  addTaskToDatabase: addTaskToDatabase,
  getAllTaskList: getAllTaskList,
  getCurrentUserOpenId: getCurrentUserOpenId,
  getCurrentUserTaskList: getCurrentUserTaskList,
  getCurrentUserInfo: getCurrentUserInfo,
}