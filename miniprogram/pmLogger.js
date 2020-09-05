var debugLog = function(logContent) {
  let debugSwitch = true;
  if (debugSwitch) {
    console.log(logContent);
  }
}

module.exports={
  debugLog: debugLog,
}