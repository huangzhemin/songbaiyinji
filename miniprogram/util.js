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

module.exports={
  convertInnerTaskToDatabaseTask: convertInnerTaskToDatabaseTask,
  convertDatabaseTaskToInnerTask: convertDatabaseTaskToInnerTask,
}