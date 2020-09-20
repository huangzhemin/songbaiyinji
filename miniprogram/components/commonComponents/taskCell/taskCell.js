const util = require("../../../util");

// components/personalComponents/taskCell/taskCell.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '任务标题',
    },
    desc: {
      type: String,
      value: '任务标题',
    },
    thumbImg: {
      type: String,
      value: '',
    },
    status: {
      type: Number,
      value: 0,
    },
    avatar: {
      type: String,
      value: '',
    },
    nickName: {
      type: String,
      value: '昵称',
    },
    pubTime: {
      type: String,
      value: '创建时间',
    },
    taskUserOpenId: {
      type: String,
      value: '',
    },
    taskId: {
      type: String,
      value: '',
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    tag: '',
    pubTimeStr: '',
  },

  observers: {
    'status': function (status) {
      // 当property statusc传入的状态改变的时候，tag需要做相应的调整
      this.setData({
        tag: this.getTagNameWithStatus(this.properties.status),
      });
    },
    'pubTime': function (pubTime) {
      this.setData({
        pubTimeStr: new Date(this.properties.pubTime * 1000).toLocaleString(),
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 0 - 进行中
    // 1 - 猜一猜
    // 2 - 投票
    // 3 - 完成
    // 4 - 失败
    getTagNameWithStatus: function (status) {
      var tag = '标签';
      switch (status) {
        case 0:
          tag = '进行中';
          break;
        case 1:
          tag = '猜一猜';
          break;
        case 2:
          tag = '投票';
          break;
        case 3:
          tag = '完成';
          break;
        case 4:
          tag = '失败';
          break;
        default:
          break;
      }
      return tag;
    },

    jumpTaskDetail() {
      var url = '/pages/taskDetail/taskDetail';
      let that = this;
      wx.navigateTo({
        url: url,
        success: function (res) {
          // 通过eventChannel向被打开页面传送数据
          console.log('that.properties', that.properties);
          res.eventChannel.emit('acceptDataFromOpenerPage', {
            'openId': that.properties.taskUserOpenId, //类似'oBG1A5f75CT8Bj1gAG4OMkXgDyXM',
            'taskId': that.properties.taskId, //类似'task0','task1'
          })
        }
      })
    },

    onClick(event) {
      console.log('taskCell click jumpTaskDetail');
      this.jumpTaskDetail();
    }
  }
})