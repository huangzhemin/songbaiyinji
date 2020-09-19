const util = require("../../util");

// miniprogram/pages/taskDetail/taskDetail.js
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
    console.log('options', options);
    if (options['share']) {
      console.log('share scheme');
      console.log('util.getCurrentUserOpenId()', util.getCurrentUserOpenId());
      console.log('options_openId' , options['openId']);
      let that = this;
      util.getCurrentUserOpenId({
        success: function(openId) {
          that.setData({
            openId: options['openId'],
            taskId: options['taskId'],
            canJudge: options['canJudge'],
            isSelf: (openId == options['openId']),
          });
        },
      });
    } else {
      console.log('list entrance');
      // 获取传入参数
      const eventChannel = this.getOpenerEventChannel()
      // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
      let that = this;
      eventChannel.on('acceptDataFromOpenerPage', function (prePageData) {
        console.log('prePageData', prePageData);
        that.setData({
          openId: prePageData.openId,
          taskId: prePageData.taskId,
          canJudge: prePageData.canJudge,
          isSelf: prePageData.isSelf,
        });
      })
    }
  },

  ///////////////分享相关///////////////
  onShareAppMessage: function (res) {
    console.log('onShareAppMessage', res)
    if (res.from === 'sharePannel') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    console.log('this.data.openId', this.data.openId);
    return {
      title: this.data.taskTitle,
      path: '/pages/taskDetail/taskDetail?share=true&openId='+this.data.openId+'&taskId='+this.data.taskId+'&canJudge='+this.data.canJudge,
    }
  },
})