// miniprogram/pages/createTask/createTask.js
const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
var util = require('../../util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
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

    promiseArr: [],
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
    this.uploadMedias({
      success: function(res) {
        for (const key in res) {
          if (res.hasOwnProperty(key)) {
            const element = res[key];
            that.data.taskMediaList.push(element['fileID']);
          }
        }
        that.addTaskToDatabase({
          success: function(res1) {
            that.clearTaskContent();
            wx.switchTab({
              url: '/pages/tabbar/task/task',
            })
          }
        })
      },
      fail: function(err) {
        console.error(err);
      }
    });
  },

  onCancelClick: function(event) {
    this.clearTaskContent();
  },

  addTaskToDatabase: function(event) {
    taskInfo.add({
      data: util.convertInnerTaskToDatabaseTask(this.data),
    }).then(res => {
      console.log(res);
      event.success(res);
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

  uploadMedias: function (event) {
    this.data.promiseArr = [];

    this.uploadBatchMedia({
      uploadMediaList:this.data.taskPlan.uploadMediaList, 
      type:'plan',
    })

    this.uploadBatchMedia({
      uploadMediaList:this.data.taskComplete.uploadMediaList, 
      type:'complete',
    })

    Promise.all(this.data.promiseArr).then((result) => {
      this.data.promiseArr = [];
      event.success(result);
      wx.hideLoading();
    });
  },

  uploadBatchMedia: function(event) {
    let type = event['type'];
    let uploadMediaList = event['uploadMediaList'];
    for (var i = 0; i < uploadMediaList.length; i ++) {
      let promise = new Promise((resolve, reject) => {
        //此处后续需要优化为 openid + taskid + plan/complete + index
        let userMediaCloudPath = 'openid_' + 'taskid_' + type + '_' + i.toString() + '.png'; //此处需要结合用户登录态的openid，随机函数也需要优化
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
      taskPlan: {
        taskDesc: '',
        uploadMediaList: '',
        showUpload: true,
      },
      taskComplete: {
        taskDesc: '',
        uploadMediaList: '',
        showUpload: true,
      },
      taskMediaList: [],
    });
  },

  previewImage: function (event) {
    wx.previewImage({
      // current: '', // 当前显示图片的http链接
      urls: this.data.taskPlanUploadMediaList // 需要预览的图片http链接列表
    })
  }
})