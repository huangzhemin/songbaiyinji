// miniprogram/pages/tcbRouterTest/tcbRouterTest.js
Page({
  user: function() {
    console.log("user");

    // 调用名为 router 的云函数，路由名为 user
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: "tcbRouterTest",
      // 传递给云函数的参数
      data: {
          $url: "user", // 要调用的路由的路径，传入准确路径或者通配符*
      }
    }).then(res => {
      console.log(res);
    });
  }, 

  school: function() {
    console.log("school");

    // 调用名为 router 的云函数，路由名为 user
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: "tcbRouterTest",
      // 传递给云函数的参数
      data: {
          $url: "school", // 要调用的路由的路径，传入准确路径或者通配符*
      }
    }).then(res => {
      console.log(res);
    });
  }
  
})