// miniprogram/pages/taskDetail/taskDetail.js
const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
const util = require('../../util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showShare: false,
    options: 
    [
      [{
          name: '微信',
          icon: 'wechat'
        },
        {
          name: '微博',
          icon: 'weibo'
        },
        {
          name: 'QQ',
          icon: 'qq'
        },
      ],
      [{
          name: '复制链接',
          icon: 'link'
        },
        {
          name: '分享海报',
          icon: 'poster'
        },
        {
          name: '二维码',
          icon: 'qrcode'
        },
      ],
    ],
  },

  onLoad: function(options) {
    // 获取传入参数
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    var that = this;
    eventChannel.on('acceptDataFromOpenerPage', function (prePageData) {
      console.log('prePageData', prePageData);
      that.setData({
        openId: prePageData.openId,
        taskId: prePageData.taskId,
        canJudge: prePageData.canJudge,
        isSelf: prePageData.isSelf,
      });
    })
  },

  ///////////////分享相关///////////////
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log(res)
    if (res.from === 'sharePannel') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: this.data.taskTitle,
      path: '/page/taskDetail/taskDetail'
    }
  },
})