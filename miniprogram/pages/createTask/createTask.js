// miniprogram/pages/createTask/createTask.js
const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
var util = require('../../util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskId: "",
    openId: '',
    status: 0,  //进行中

    taskTitle: "",
    taskPlanDesc: "",
    taskPlanUploadMediaList: [],
    taskPlanShowUpload: true,

    taskCompleteDesc: "",
    taskCompleteUploadMediaList: [],
    taskCompleteShowUpload: true,

    thumbImg: "",
    taskMediaList: [],

    avatar: '',
    nickName: '',
    pubTime: '',

    promiseArr: [],
  },

  onContentChange: function(event) {
    let currentChangeFieldId = event.currentTarget['id'];
    switch (currentChangeFieldId) {
      case 'taskTitle':
        this.data.taskTitle = event.detail;
        break;
      case 'taskPlanDesc':
        this.data.taskPlanDesc = event.detail;
        break;
      case 'taskCompleteDesc':
        this.data.taskCompleteDesc = event.detail;
        break;
      default:
        console.log(currentChangeFieldId+event.detail);
      }
  },

  //用户行为操作
  //当前用户调整
  onSelfControlPannelClick: function (event) {
    //展示loadingview
    wx.showLoading({
      title: '上传中...',
      mask: true,
    });
    let targetId = event.target['id'];
    var status = 0;
    var operationType = '';
    if (targetId == 'create') {
      status = 0,
      operationType = 'create';
    } else if (targetId == 'cancel') {
      operationType = 'cancel';
      this.clearTaskContent();
      wx.hideLoading();
    }

    //先这样，下午合并的时候，和updateTask一起处理
    if (targetId == 'create') {
      var that = this;
      this.addTaskToDatabase({
        status: status,
        operationType: operationType,
        success: function(res1) {
          that.clearTaskContent();
          wx.hideLoading();
          wx.switchTab({
            url: '/pages/tabbar/task/task',
          })
        }
      })  
    }
  },

  addTaskToDatabase: function(event) {
    //在添加之前，需要使用当前用户已经创建的task数量，计算出当前的taskid
    let that = this;
    this.getTaskInfo({
      success:function(res) {
        that.uploadMedias({
          openId: that.data.openId,
          taskId: that.data.taskId,
          success: function(res1) {
            for (const key in res1) {
              if (res1.hasOwnProperty(key)) {
                const element = res1[key];
                if (element['fileID'].match('plan_0')) {
                  that.data.thumbImg = element['fileID'];
                }
                that.data.taskMediaList.push(element['fileID']);
              }
            }

            taskInfo.add({
              data: util.convertInnerTaskToDatabaseTask(that.data),
            }).then(res2 => {
              //在任务状态更新完成的时候，需要将当前任务、以及当前任务的操作行为添加到消息数据库，目前先和积分分开处理，后续搬迁到云函数执行
              util.addUserOperationMsgWithOperateAndCurrentTaskInfo({
                operationType: event.operationType,
                taskInfo: that.data
              });
              event.success(res2);
            });
          },
          fail: function(err) {
            console.error(err);
          }
        });
      }
    });
  },

  //包含 taskId, avatar，nickName，pubTime
  getTaskInfo: function(event) {
    var that = this;
    util.getCurrentUserTaskList({
      success: function(taskInfoRes) {
        console.log('createTask currentTaskInfoLength:'+taskInfoRes.data.length);
        that.data.taskId = 'task'+taskInfoRes.data.length;
        util.getCurrentUserInfo({
          success: function(openId, userInfoRes) {
            that.data.openId = openId;
            that.data.avatar = userInfoRes.data[0].avatarUrl;
            that.data.nickName = userInfoRes.data[0].nickName;
            that.data.pubTime = Date.parse(new Date()) / 1000;
            event.success();
          },
        })
      }
    });
  },
  
  chooseImage: function (event) {
    let chooseTaskUploadBtnId = event.currentTarget["id"];
    let currentTaskUploadMediaList = this.data.taskPlanUploadMediaList;
    if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
      currentTaskUploadMediaList = this.data.taskPlanUploadMediaList;
    } else if (chooseTaskUploadBtnId == 'taskCompleteUploadClick') {
      currentTaskUploadMediaList = this.data.taskCompleteUploadMediaList;
    }
    wx.chooseImage({
      count: 9 - currentTaskUploadMediaList.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    }).then (res => {
      // tempFilePath可以作为img标签的src属性显示图片
      if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
        this.setData({
          ['taskPlanUploadMediaList']: currentTaskUploadMediaList.concat(res.tempFilePaths),
          ['taskPlanShowUpload']: (currentTaskUploadMediaList.length + res.tempFilePaths.length < 9) ? true : false,
        })
      } else if (chooseTaskUploadBtnId == 'taskCompleteUploadClick') {
        this.setData({
          ['taskCompleteUploadMediaList']: currentTaskUploadMediaList.concat(res.tempFilePaths),
          ['taskCompleteShowUpload']: (currentTaskUploadMediaList.length + res.tempFilePaths.length < 9) ? true : false,
        });
      }
    }).catch(err => {
      console.error(err)
    })
  },

  uploadMedias: function (event) {
    this.data.promiseArr = [];

    this.uploadBatchMedia({
      openId: event.openId,
      taskId: event.taskId,
      uploadMediaList:this.data.taskPlanUploadMediaList, 
      type:'plan',
    })

    this.uploadBatchMedia({
      openId: event.openId,
      taskId: event.taskId,
      uploadMediaList:this.data.taskCompleteUploadMediaList, 
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
      let promise = new Promise((resolve, reject) => {
        //此处后续需要优化为 openid + taskid + plan/complete + index
        let userMediaCloudPath = event.openId + '_' + event.taskId + '_' + type + '_' + i.toString() + '.png'; //此处需要结合用户登录态的openid，随机函数也需要优化
        wx.cloud.uploadFile({
          cloudPath: userMediaCloudPath,
          filePath: uploadMediaList[i],
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

  clearTaskContent: function(event) {
    this.setData({
      taskTitle: '',
      taskPlanDesc: "",
      taskPlanUploadMediaList: [],
      taskPlanShowUpload: true,
      taskCompleteDesc: "",
      taskCompleteUploadMediaList: [],
      taskCompleteShowUpload: true,
      taskMediaList: [],
    });
  },

  previewImage: function (event) {
    let dataset = event.target.dataset;
    var type = dataset['type'];
    var index = dataset['index'];
    var currentMediaList = [];
    if (type == 'plan') {
      currentMediaList = this.data.taskPlanUploadMediaList;
    } else if (type == 'complete') {
      currentMediaList = this.data.taskCompleteUploadMediaList;
    }
    wx.previewImage({
      current: currentMediaList[index], // 当前显示图片的http链接
      urls: currentMediaList // 需要预览的图片http链接列表
    })
  },
})