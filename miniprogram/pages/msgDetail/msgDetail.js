// miniprogram/pages/msgDetail/msgDetail.js
const util = require('../../util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    userMsgList: [],
  },

  //消息列表拉取数据
  //思路：
  //1.参数传递，当前用户openId从个人页带入
  //2.数据库查询，根据当前用户 openId，倒排查询
  //3.数据打通，pm-announcement-list展示承接
  //4.UI样式调整

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //1.参数传递，当前用户openId从个人页带入
    //获取传入参数
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    var that = this;
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      that.data.openId = data.openId;

      //2.数据库查询，根据当前用户 openId，倒排查询
      util.getCurrentUserMsgList({
        openId: that.data.openId,
        success: function(userMsgList) {
          //完成具体的展示逻辑
          console.log(userMsgList);
          that.setData({
            userMsgList: userMsgList,
          });
        }
      });
    });
  },
})