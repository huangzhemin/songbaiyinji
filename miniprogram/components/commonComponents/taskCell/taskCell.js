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
  },
  
  observers: {
    'status': function(status) {
      // 当property statusc传入的状态改变的时候，tag需要做相应的调整
      this.setData({
        tag: this.getTagNameWithStatus(this.properties.status),
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
    getTagNameWithStatus: function(status) {
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

    onClick(event) {
      var url = '/pages/taskDetail/taskDetail';
      var that = this;
      util.getCurrentUserInfo({
        success: function(currentUserOpenId, userInfoRes) {
          //此处判断需要跳转的链接
          //warning 
          if (currentUserOpenId == that.properties.taskUserOpenId) {
            //自身：传入的openId与自身openId是同一个
            url = '/pages/taskDetail/taskDetail';
          } else {
            //其他人：传入openId与自身openId不同
            if (userInfoRes.data[0]['canVote']) {
              //具有投票权限的用户
              url = '/pages/voteDetail/voteDetail';
            } else {
              //普通用户
              url = '/pages/guessDetail/guessDetail';
            }
          }
          //跳转逻辑
          wx.navigateTo({
            url: url,
            success: function(res) {
              // 通过eventChannel向被打开页面传送数据
              res.eventChannel.emit('acceptDataFromOpenerPage', { 
                'openId': that.properties.taskUserOpenId,   //类似'oBG1A5f75CT8Bj1gAG4OMkXgDyXM',
                'taskId': that.properties.taskId,           //类似'task0','task1'
               })
            }
          })
        },
       }
      );
    }
  }
})
