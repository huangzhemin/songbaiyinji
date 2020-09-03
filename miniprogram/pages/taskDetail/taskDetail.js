// miniprogram/pages/taskDetail/taskDetail.js
const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
var util = require('../../util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskId: "",
    status: 0,

    taskTitle: "",
    taskPlan: {
      taskDesc: "",
      uploadMediaList: [],
      showUpload: true,
    },
    taskComplete: {
      taskDesc: "",
      uploadMediaList: [],
      showUpload: true,
    },
    taskMediaList: [],

    currentOpenId: '',
    currentTaskId: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取传入参数
    const eventChannel = this.getOpenerEventChannel()
    this.data.currentOpenId = '';
    this.data.currentTaskId = '';
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    var that = this;
    eventChannel.on('acceptDataFromOpenerPage', function(data) {
      that.data.currentOpenId = data.openId;
      that.data.currentTaskId = data.taskId;
    })

    wx.showLoading({
      title: 'loading...',
    })
    //通过传入的openId和taskId，拉取用户数据
    taskInfo.where({
      openId: that.data.currentOpenId,
      taskId: that.data.currentTaskId,
    }).get().then(res => {
      that.data.taskMediaList = res.data[0]['taskMediaList'];
      let uploadMediaListDic = util.getUploadMediaList(that.data.currentOpenId, 
                                                       that.data.currentTaskId, 
                                                       that.data.taskMediaList);
      that.setData({
        taskTitle: res.data[0]['taskTitle'],
        status: res.data[0]['status'],
        ['taskPlan.taskDesc']: res.data[0]['taskPlanDesc'],
        ['taskPlan.uploadMediaList']: uploadMediaListDic['taskPlan'],
        ['taskComplete.taskDesc']: res.data[0]['taskCompleteDesc'],
        ['taskComplete.uploadMediaList']: uploadMediaListDic['taskComplete'],
      });
    }).then(res1 => {
      wx.hideLoading();
    });
  },

  onContentChange: function(event) {
    let currentChangeFieldId = event.currentTarget['id'];
    switch (currentChangeFieldId) {
      case 'taskTitle':
        this.data.taskTitle = event.detail;
        break;
      case 'taskPlanDesc':
        this.data.taskPlan.taskDesc = event.detail;
        break;
      case 'taskCompleteDesc':
        this.data.taskComplete.taskDesc = event.detail;
        break;
      default:
        console.log(currentChangeFieldId+event.detail);
      }
  },

  onSubmitClick: function(event) {
    //展示loadingview
    wx.showLoading({
      title: '上传中...',
      mask: true,
    });

    var that = this;
    this.updateTaskToDatabase({
      success: function(res) {
        wx.hideLoading();
        wx.navigateBack();
      }
    })
  },

  onCancelClick: function(event) {
    //展示loadingview
    wx.showLoading({
      title: '上传中...',
      mask: true,
    });
    //退出当前页面，需要更新后退出
    //根据当前的用户openId 和 taskId，来定位更新的列表
    var that = this;
    this.updateTaskToDatabase({
      status: 4,
      success: function(res) {
        wx.hideLoading();
        wx.navigateBack();
      }
    })
  },

  updateTaskToDatabase: function(event) {
    var that = this;
    //此处赋值任务状态，是继续进行，还是放弃
    that.data.status = event.status;
    //先清理历史的taskMediaList，保证从当前的图片列表中，二次
    this.getTaskInfo({
      success:function(res) {
        that.uploadMedias({
          openId: that.data.currentOpenId,
          taskId: that.data.currentTaskId,
          success: function(res) {
            for (const key in res) {
              if (res.hasOwnProperty(key)) {
                const element = res[key];
                if (element['fileID'].match('plan_0')) {
                  that.data.thumbImg = element['fileID'];
                }
                that.data.taskMediaList.push(element['fileID']);
              }
            }

            taskInfo.where({
              openId: that.data.currentOpenId,
              taskId: that.data.currentTaskId,
            }).update({
              data: util.convertInnerTaskToDatabaseTask(that.data),
            }).then(res1 => {
              event.success(res1);
            });
          },
          fail: function(err) {
            console.error(err);
          }
        });
      }
    });
  },

  uploadMedias: function (event) {
    this.data.promiseArr = [];

    this.uploadBatchMedia({
      openId: event.openId,
      taskId: event.taskId,
      uploadMediaList:this.data.taskPlan.uploadMediaList, 
      type:'plan',
    })

    this.uploadBatchMedia({
      openId: event.openId,
      taskId: event.taskId,
      uploadMediaList:this.data.taskComplete.uploadMediaList, 
      type:'complete',
    })

    Promise.all(this.data.promiseArr).then((result) => {
      this.data.promiseArr = [];
      event.success(result);
    });
  },

  uploadBatchMedia: function(event) {
    let type = event['type'];
    let uploadMediaList = event['uploadMediaList'];
    
    for (var i = 0; i < uploadMediaList.length; i ++) {
      //此处需要判断当前的filePath的前缀是否符合预期
      let filePath = uploadMediaList[i];
      if (filePath.match('cloud://')) {
        //如果当前的filePath的前缀为cloud://，说明已经是fileId形式，跳过
        //我们只需要关注前缀为http的文件并上传
        continue;
      }
      let promise = new Promise((resolve, reject) => {
        //此处后续需要优化为 openid + taskid + plan/complete + index
        let userMediaCloudPath = event.openId + '_' + event.taskId + '_' + type + '_' + i.toString() + '.png'; //此处需要结合用户登录态的openid，随机函数也需要优化
        wx.cloud.uploadFile({
          cloudPath: userMediaCloudPath,
          filePath: filePath,
        }).then(res => {
          // get resource ID
          resolve(res);
        }).catch(err => {
          // handle error
          console.error(err)
          reject(err);
        })
      });
      this.data.promiseArr.push(promise);
    }
  },

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

  onShareBtnClick: function(event) {
    this.setData({ showShare: true });
  },

  onSharePannelClose: function(event) {
    this.setData({ showShare: false });
  },

  onSharePannelSelect: function(event) {
    let res = {from: "sharePannel", target:event.detail["icon"]};
    this.onShareAppMessage(res);
    this.onSharePannelClose();
  },

  //包含 taskId, avatar，nickName，pubTime
  getTaskInfo: function(event) {
    var that = this;
    util.getCurrentUserTaskList({
      success: function(taskInfoRes) {
        that.data.taskId = that.data.currentTaskId;
        util.getCurrentUserInfo({
          success: function(openId, userInfoRes) {
            that.data.openId = openId;
            that.data.avatar = userInfoRes.data[0].avatarUrl;
            that.data.nickName = userInfoRes.data[0].nickName;
            that.data.pubTime = (new Date()).toLocaleTimeString();
            event.success();
          },
        })
      }
    });
  },

  chooseImage: function (event) {
    let chooseTaskUploadBtnId = event.currentTarget["id"];
    let currentTaskUpload = this.data.taskPlan;
    if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
      currentTaskUpload = this.data.taskPlan;
    } else if (chooseTaskUploadBtnId == 'taskCompleteUploadClick') {
      currentTaskUpload = this.data.taskComplete;
    }
    wx.chooseImage({
      count: 9 - currentTaskUpload.uploadMediaList.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    }).then (res => {
      // tempFilePath可以作为img标签的src属性显示图片
      if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
        this.setData({
          ['taskPlan.uploadMediaList']: currentTaskUpload.uploadMediaList.concat(res.tempFilePaths),
          ['taskPlan.showUpload']: (currentTaskUpload.uploadMediaList.length + res.tempFilePaths.length < 9) ? true : false,
        })
      } else if (chooseTaskUploadBtnId == 'taskCompleteUploadClick') {
        this.setData({
          ['taskComplete.uploadMediaList']: currentTaskUpload.uploadMediaList.concat(res.tempFilePaths),
          ['taskComplete.showUpload']: (currentTaskUpload.uploadMediaList.length + res.tempFilePaths.length < 9) ? true : false,
        });
      }
    }).catch(err => {
      console.error(err)
    })
  },

  previewImage: function (event) {
    wx.previewImage({
      // current: '', // 当前显示图片的http链接
      urls: this.data.taskMediaList // 需要预览的图片http链接列表
    })
  }
})