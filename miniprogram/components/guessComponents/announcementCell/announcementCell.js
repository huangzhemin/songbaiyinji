// components/announcementCell/announcementCell.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    avatar: {
      type: String,
      value: 'user-circle-o',
    },
    nickName: {
      type: String,
      value: '昵称',
    },
    desc: {
      type: String,
      value: '描述',
    },
    msgTime: {
      type: Number,
      value: 0
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    msgTimeStr: '',
  },

  observers: {
    'msgTime': function(msgTime) {
      this.setData({
        msgTimeStr: new Date(this.properties.msgTime * 1000).toLocaleString(),
      });
    }
  },


  /**
   * 组件的方法列表
   */
  methods: {

  }
})
