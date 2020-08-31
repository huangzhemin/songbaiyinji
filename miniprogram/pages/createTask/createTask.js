// miniprogram/pages/createTask/createTask.js
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
    }
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
    console.log(this.data)
  },

  onCancelClick: function(event) {

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
    }).then(res => {
      // tempFilePath可以作为img标签的src属性显示图片
      if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
        this.setData({
          taskPlan: {
            uploadMediaList: currentTaskUpload.uploadMediaList.concat(res.tempFilePaths),
            showUpload: (currentTaskUpload.uploadMediaList.length + res.tempFilePaths.length < 9) ? true : false,
          }
        });
      }  else if (chooseTaskUploadBtnId == 'taskCompleteUploadClick') {
        this.setData({
          taskComplete: {
            uploadMediaList: currentTaskUpload.uploadMediaList.concat(res.tempFilePaths),
            showUpload: (currentTaskUpload.uploadMediaList.length + res.tempFilePaths.length < 9) ? true : false,
          }
        });
      }
    })
  },

  previewImage: function (event) {
    console.log(event.currentTarget);
    wx.previewImage({
      // current: '', // 当前显示图片的http链接
      urls: this.data.taskPlanUploadMediaList // 需要预览的图片http链接列表
    })
  }
})