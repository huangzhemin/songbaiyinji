var convertInnerTaskToDatabaseTask = function(innerTaskData) {
  // console.log(innerTaskData);
  let databaseTaskData = {
    'taskTitle': innerTaskData['taskTitle'],
    'taskPlanDesc': innerTaskData['taskPlan']['taskDesc'],
    'taskCompleteDesc': innerTaskData['taskComplete']['taskDesc'],
    'taskMediaList': innerTaskData['taskMediaList'],
  };
  // console.log(databaseTaskData);
  return databaseTaskData;
}

var convertDatabaseTaskToInnerTask = function(databaseTask) {
  // console.log(databaseTaskData);
  let innerTaskData = {
    'taskTitle': databaseTaskData['taskTitle'],
    'taskPlan.taskDesc': databaseTaskData['taskPlanDesc'],
    'taskComplete.taskDesc': databaseTaskData['taskCompleteDesc'],
    'taskMediaList': databaseTaskData['taskMediaList'],
  };
  // console.log(innerTaskData);
  return innerTaskData;
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

module.exports={
  convertInnerTaskToDatabaseTask: convertInnerTaskToDatabaseTask,
  convertDatabaseTaskToInnerTask: convertDatabaseTaskToInnerTask,
  getUploadMediaList: getUploadMediaList,
}