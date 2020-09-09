// miniprogram/pages/taskDetail/taskDetail.js
const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
const util = require('../../util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskId: "",
    openId: "",
    status: 0,

    taskTitle: "",
    taskPlanDesc: "",
    taskPlanUploadMediaList: [],
    taskPlanShowUpload: true,

    taskCompleteDesc: "",
    taskCompleteUploadMediaList: [],
    taskCompleteShowUpload: true,

    taskMediaList: [],
    supportUserList: [],
    opposeUserList: [],

    canJudge: false,
    isSelf: false,

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
      console.log('that.data1', that.data);
      that.data.openId = prePageData.openId;
      that.data.taskId = prePageData.taskId;
      console.log('that.data2', that.data);
      that.loadDetailTaskData(prePageData.canJudge, prePageData.isSelf);
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  loadDetailTaskData: function (canJudge, isSelf) {
    var that = this;
    console.log('00000000000000', that.data);
    wx.showLoading({
      title: 'loading...',
    })
    //通过传入的openId和taskId，拉取用户数据
    taskInfo.where({
      openId: that.data.openId,
      taskId: that.data.taskId,
    }).get().then(res => {
      //将当前的任务数据，赋值到本地
      console.log('111111111', res.data[0]);
      console.log('222222222', util.convertDatabaseTaskToInnerTask(res.data[0]));
      that.data = util.convertDatabaseTaskToInnerTask(res.data[0]);
      //上传媒体单独处理
      let uploadMediaListDic = util.getUploadMediaList(that.data.openId,
                                                       that.data.taskId,
                                                       that.data.taskMediaList);
      console.log('a0000000', that.data);
      console.log('canJudge', that.data.canJudge);
      console.log('isSelf', that.data.isSelf);
      //刷新页面                                                        
      that.setData({
        taskTitle: that.data.taskTitle,
        status: that.data.status,
        canJudge: canJudge,   //是否可以裁判，是结合当前使用用户，外部传入属性，不受数据库数据影响
        isSelf: isSelf,       //是否是用户自身，是结合当前使用用户，外部传入属性，不受数据库数据影响
        ['taskPlanDesc']: that.data.taskPlanDesc,
        ['taskPlanUploadMediaList']: uploadMediaListDic['taskPlan'],
        ['taskCompleteDesc']: that.data.taskCompleteDesc,
        ['taskCompleteUploadMediaList']: uploadMediaListDic['taskComplete'],
      });
      console.log('b0000000', that.data);
    }).then(res1 => {
      wx.hideLoading();
    });
  },

  onContentChange: function (event) {
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
        console.log(currentChangeFieldId + event.detail);
    }
  },

  ////////////////////////////////////
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
    if (targetId == 'modify') {
      status = 0;
      operationType = 'modify';
    } else if (targetId == 'giveup') {
      status = 4;
      operationType = 'giveup';
    }
    this.updateTaskToDatabase({
      status: status,
      operationType: operationType,
      success: function (openId, taskId) {
        wx.hideLoading();
        wx.navigateBack();
      }
    })
  },

  //非当前用户，猜一猜相关
  onGuessPannelClick: function (event) {
    console.log('00000000', this.data);
    let targetId = event.target['id'];
    var that = this;
    var guessSuccess = false;
    var operationType = '';
    console.log('10000000', that.data);
    util.getCurrentUserOpenId({
      success: function (openId) {
        if (targetId == 'support') {
          //如果支持的话，将当前用户的openId，加入到支持数据列表
          if (that.data.supportUserList.indexOf(openId) == -1) {
            that.data.supportUserList.push(openId);
            guessSuccess = true;
            operationType = 'support';
            wx.showLoading({
              title: '支持成功...',
            });
          } else {
            wx.showToast({
              title: '您已支持过',
            });
          }
        } else if (targetId == 'oppose') {
          //如果反对的话，将当前用户的openId，加入到反对数据列表
          if (that.data.opposeUserList.indexOf(openId) == -1) {
            that.data.opposeUserList.push(openId);
            guessSuccess = true;
            operationType = 'oppose';
            wx.showLoading({
              title: '反对成功...',
            });
          } else {
            wx.showToast({
              title: '您已反对过',
            });
          }
        }

        console.log('guessSuccess:', guessSuccess);
        if (guessSuccess) {
          //如果猜一猜成功，则需要上传数据
          that.updateTaskToDatabase({
            operationType: operationType,
            success: function (openId, taskId) {
              wx.hideLoading();
              wx.navigateBack();
            }
          })
        } else {
          //如果已经猜一猜，则直接退出
          wx.navigateBack();
        }
      },
    });
  },

  //裁判相关 judge
  onJudgePannelClick: function (event) {
    let targetId = event.target['id'];
    var status = 0;
    var operationType = '';
    if (targetId == 'complete') {
      //如果完成，则任务进入state=3，并更新
      status = 3;
      operationType = 'complete';
    } else if (targetId == 'fail') {
      //如果失败，则任务进入state=4，并更新
      status = 4;
      operationType = 'fail';
    }
    var that = this;
    this.updateTaskToDatabase({
      operationType: operationType,
      status: status,
      success: function (openId, taskId) {
        that.calculatePoints(openId, taskId);
        wx.hideLoading();
        wx.navigateBack();
      }
    });
  },
  ////////////////////////////////////

  updateTaskToDatabase: function (event) {
    console.log('11111111111', this.data);
    var that = this;
    //此处赋值任务状态，是继续进行，还是放弃
    that.data.status = event.status;
    console.log('1222222', this.data);
    //更新资源信息
    console.log('222222222', that.data);
    that.uploadMedias({
      openId: that.data.openId,
      taskId: that.data.taskId,
      success: function (mediasRes) {
        //将上传资源生成的fileID，进行管理
        if (mediasRes && mediasRes.length > 0) {
          for (const key in mediasRes) {
            const element = mediasRes[key];
            //将任务计划的第一张图片，作为缩略图
            if (element['fileID'].match('plan_0')) {
              that.data.thumbImg = element['fileID'];
            }
            that.data.taskMediaList.push(element['fileID']);
          }
        }
        console.log('33333333', that.data);
        console.log('33333333', util.convertInnerTaskToDatabaseTask(that.data));

        //制定当前用户、当前任务，进行任务内容的更新
        taskInfo.where({
          openId: that.data.openId,
          taskId: that.data.taskId,
        }).update({
          data: util.convertInnerTaskToDatabaseTask(that.data),
        }).then(taskInfoUpdateRes => {
          console.log('taskInfoUpdateRes', taskInfoUpdateRes);
          //在任务状态更新完成的时候，需要将当前任务、以及当前任务的操作行为添加到消息数据库，目前先和积分分开处理，后续搬迁到云函数执行
          util.addUserOperationMsgWithOperateAndCurrentTaskInfo({
            operationType: event.operationType,
            taskInfo: that.data
          });
          //当前任务完成后的回调，具体执行积分计算 和 页面UI收尾工作
          event.success(that.data.openId, that.data.taskId);
        });
      },
      fail: function (err) {
        console.error(err);
      }
    });
  },

  uploadMedias: function (event) {
    //上传媒体信息的时候，如果此次没有对列表进行调整的话，这里无需再次上传
    console.log('teeeeeeeeeeeeeest', this.data);
    if (!this.data.taskPlanUploadMediaList 
        && !this.data.taskCompleteUploadMediaList) {
      console.log('aaaaaaaaaaaaaaa')
      event.success();
      return;
    }

    //此次操作 对媒体信息有调整
    this.data.promiseArr = [];
    this.uploadBatchMedia({
      openId: event.openId,
      taskId: event.taskId,
      uploadMediaList: this.data.taskPlanUploadMediaList,
      type: 'plan',
    })

    this.uploadBatchMedia({
      openId: event.openId,
      taskId: event.taskId,
      uploadMediaList: this.data.taskCompleteUploadMediaList,
      type: 'complete',
    })

    Promise.all(this.data.promiseArr).then((result) => {
      this.data.promiseArr = [];
      event.success(result);
    });
  },

  uploadBatchMedia: function (event) {
    let type = event['type'];
    let uploadMediaList = event['uploadMediaList'];

    for (var i = 0; i < uploadMediaList.length; i++) {
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

  chooseImage: function (event) {
    let chooseTaskUploadBtnId = event.currentTarget["id"];
    let currentTaskUploadMediaList = this.data.taskPlanUploadMediaList;
    if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
      currentTaskUploadMediaList = this.data.taskPlanUploadMediaList;
    } else if (chooseTaskUploadBtnId == 'taskCompleteUploadClick') {
      currentTaskUploadMediaList = this.data.taskCompleteUploadMediaList;
    }
    console.log('this is a ', this.data);
    console.log('this is b ', currentTaskUpload);

    wx.chooseImage({
      count: 9 - currentTaskUploadMediaList.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    }).then(res => {
      // tempFilePath可以作为img标签的src属性显示图片
      if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
        this.setData({
          ['taskPlanUploadMediaList']: currentTaskUpload.uploadMediaList.concat(res.tempFilePaths),
          ['taskPlanShowUpload']: (currentTaskUpload.uploadMediaList.length + res.tempFilePaths.length < 9) ? true : false,
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

  previewImage: function (event) {
    let dataset = event.target.dataset;
    var type = dataset['type'];
    var index = dataset['index'];
    var currentMediaList = [];
    for (const key in this.data.taskMediaList) {
      if (this.data.taskMediaList.hasOwnProperty(key)) {
        const element = this.data.taskMediaList[key];
        if (type == 'plan' && element.match('_plan_')) {
          currentMediaList.push(element);
        } else if (type == 'complete' && element.match('_complete_')) {
          currentMediaList.push(element);
        }
      }
    }
    wx.previewImage({
      current: currentMediaList[index], // 当前显示图片的http链接
      urls: currentMediaList // 需要预览的图片http链接列表
    })
  },
  ////////////////////////////////////

  calculatePoints: function (openId, taskId) {
    //此处成功的话，调用云函数，任务数据进行积分分配
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: "calculatePoints",
      data: {
        openId: openId,
        taskId: taskId,
      }
    }).then(res => {
      util.debugLog('calculatePoints:', res);
    });

    // 拉取任务信息 test
    // wx.cloud.callFunction({
    //   // 要调用的云函数名称
    //   name: 'tcbDatabase',
    //   // 传递给云函数的参数
    //   data: {
    //     $url: "taskInfoWithOpenIdAndTaskId",
    //     openId: openId,
    //     taskId: taskId,
    //   }
    // }).then(res => {
    //   console.log('taskInfoDic after:', res.result.data.data[0]);
    //   // taskInfoDic = res;
    //   // console.log('taskInfoDic after:', taskInfoDic);
    // }).catch(err => {
    //   console.error(err);
    // });

    //拉取用户积分 test
    // let userOpenIdList = [
    // 'oBG1A5f75CT8Bj1gAG4OMkXgDyXM', 
    // 'oBG1A5f75CT8Bj1gAG4OMkXgDyX1',
    // 'oBG1A5f75CT8Bj1gAG4OMkXgDyX2',
    // 'oBG1A5f75CT8Bj1gAG4OMkXgDyX3',
    // 'oBG1A5f75CT8Bj1gAG4OMkXgDyY1',
    // ];

    // //此处创建空字典
    // var userPointsDic = {};

    // //数据库积分拉取
    // wx.cloud.callFunction({
    //   name: 'tcbDatabase',
    //   data: {
    //     $url: "batchGetUserPoints",
    //     userOpenIdList: userOpenIdList,
    //   },
    // }).then(res => {
    //   //此处res返回的是用户OpenId与Points构成的字典
    //   console.log('userInfoList', res.result.data.data);
    //   userPointsDic = this.convertDatabaseUserInfoListToUserPointsDic(res.result.data.data);
    //   console.log('userPointsDic', userPointsDic);
    // }).catch(err => {
    //   console.error(err);
    // });

    // 此处模拟写入假数据
    // let userPointsDic = {
    // 'oBG1A5f75CT8Bj1gAG4OMkXgDyXM': 2, 
    // 'oBG1A5f75CT8Bj1gAG4OMkXgDyX1': 1,
    // 'oBG1A5f75CT8Bj1gAG4OMkXgDyX2': 1,
    // 'oBG1A5f75CT8Bj1gAG4OMkXgDyX3': 1,
    // 'oBG1A5f75CT8Bj1gAG4OMkXgDyY1': -1,
    // };
    //积分上传，写数据库
    // wx.cloud.callFunction({
    //   name: 'tcbDatabase',
    //   data: {
    //     $url: "batchUpdateUserPoints",
    //     userPointsDic: userPointsDic,
    //   },
    // }).then(res => {
    //   console.log('result', res);
    // });
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

  onShareBtnClick: function (event) {
    console.log('x0000000', this.data);
    this.setData({
      showShare: true
    });
  },

  onSharePannelClose: function (event) {
    this.setData({
      showShare: false
    });
  },

  onSharePannelSelect: function (event) {
    let res = {
      from: "sharePannel",
      target: event.detail["icon"]
    };
    this.onShareAppMessage(res);
    this.onSharePannelClose();
  },
  ////////////////////////
})