

var isTaskDoingState = function(taskItem) {
  return taskItem.status == 0 || taskItem.status == 1 || taskItem.status == 2;
}

var isTaskCompleteState = function(taskItem) {
  return taskItem.status == 3 || taskItem.status == 4;
}

module.exports={
  isTaskDoingState: isTaskDoingState,
  isTaskCompleteState: isTaskCompleteState,
}