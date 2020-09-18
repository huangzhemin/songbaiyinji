// components/taskComponents/taskDetailComponents/taskDetailComponents.js
const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
const util = require('../../../util.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //外部传值，恒定
    propertyTaskId: {
      type: String,
      value: '',
    },
    propertyOpenId: {
      type: String,
      value: '',
    },
    propertyCanJudge: {
      type: Boolean,
      value: false,
    },
    propertyIsSelf: {
      type: Boolean,
      value: true,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    taskId: "",
    openId: "",
    status: 0,

    thumbImg: "",
    taskTitle: "",
    taskPlanDesc: "",
    taskPlanUploadMediaList: [],
    taskPlanShowUpload: true,

    taskCompleteDesc: "",
    taskCompleteUploadMediaList: [],
    taskCompleteShowUpload: true,

    taskMediaList: [],
    supportUserList: [],
    supportUserAvatarList: [],
    opposeUserList: [],
    opposeUserAvatarList: [],

    canJudge: false,
    isSelf: false,

    needLogin: false,
    showShare: false,
    loginPopupShow: false,
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

  observers: {
    'propertyTaskId, propertyOpenId': function (propertyTaskId, propertyOpenId) {
      //底层页 变量不会随时变换，这里改变必然伴随外部page传值               
      console.log('propertyOpenId', propertyOpenId);
      console.log('propertyTaskId', propertyTaskId);
      this.data.openId = propertyOpenId;
      this.data.taskId = propertyTaskId;
      //这里propertyOpenId 和 propertyTaskId 均是任务创建者信息
      if (propertyOpenId && propertyTaskId) {         
        //只有在父组件数据准备好，刷新完成后，根据字段变化情况，监听有值时，触发组件读取
        //当openId 和 taskId都有的情况下，进入任务详情页
        console.log('componentLoadPage');
        this.componentLoadPage();
      } else if (propertyOpenId && !util.validStr(propertyTaskId)) {
        //当有openId 但是 没有taskId的时候，认为任务没有创建，此时代表进入创建任务页
        console.log('createTaskPage');
        this.createTaskPage();
      } else {
        //当openId 和 taskId都没有的时候，代表目前是未登录状态创建任务
        //这种情况下，提示用户登录即可
        console.log('showLoginPage');
        this.showLoginPage();
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    createTaskPage: function(event) {
      this.setData({
        openId: this.data.openId,
        canJudge: this.properties.propertyCanJudge,
        isSelf: this.properties.propertyIsSelf,
        needLogin: false,
      });
    },

    showLoginPage: function(event) {
      this.setData({
        isSelf: true,
        needLogin: true,
      });
    },

    userLoginAndGetUserInfo:function(event) {
      let that = this;
      //通过用户信息，刷新页面
      util.userLoginAndGetUserInfo({
        userInfo: event.detail.userInfo,
        success: function(currentOpenId, latestUserInfo) {
          //通过返回的当前用户openId，直接更新登录状态和刷新页面
          if (util.validStr(currentOpenId)) {
            console.log('getUserInfo', currentOpenId, latestUserInfo)
            //此处需要根据 当前的具体来源，做不同的操作
            //刷新页面
            that.setData({
              needLogin: false,
              openId: currentOpenId,
              canJudge: latestUserInfo.canJudge,
              isSelf: true,
              loginPopupShow: false,
            });
          }
        }
      });
    },

    componentLoadPage: function (event) {
      let that = this;
      wx.showLoading({
        title: 'loading...',
      })
      //通过传入的openId和taskId，拉取用户数据
      taskInfo.where({
        openId: that.data.openId,
        taskId: that.data.taskId,
      }).get().then(res => {
        //将当前的任务数据，赋值到本地
        console.log('convertDatabaseTaskToInnerTask', util.convertDatabaseTaskToInnerTask(res.data[0]));
        that.data = util.convertDatabaseTaskToInnerTask(res.data[0]);

        //上传媒体单独处理
        let uploadMediaListDic = util.getUploadMediaList(that.data.openId,
                                                        that.data.taskId,
                                                        that.data.taskMediaList);
        console.log('uploadMediaListDic', uploadMediaListDic);

        that.data.taskPlanUploadMediaList =  uploadMediaListDic['taskPlan'];
        that.data.taskCompleteUploadMediaList = uploadMediaListDic['taskComplete'];
        //刷新页面                                                        
        that.setData({
          openId: that.data.openId,
          taskId: that.data.taskId,
          taskTitle: that.data.taskTitle,
          status: that.data.status,
          canJudge: that.properties.propertyCanJudge,   //是否可以裁判，是结合当前使用用户，外部传入属性，不受数据库数据影响
          isSelf: that.properties.propertyIsSelf,       //是否是用户自身，是结合当前使用用户，外部传入属性，不受数据库数据影响
          supportUserList: that.data.supportUserList,
          opposeUserList: that.data.opposeUserList,
          supportUserAvatarList: that.data.supportUserAvatarList.slice(0, 10),
          opposeUserAvatarList: that.data.opposeUserAvatarList.slice(0, 10),
          taskPlanDesc: that.data.taskPlanDesc,
          taskPlanUploadMediaList: that.data.taskPlanUploadMediaList,
          taskCompleteDesc: that.data.taskCompleteDesc,
          taskCompleteUploadMediaList: that.data.taskCompleteUploadMediaList,
          needLogin: false,
        });
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
      if (targetId == 'create') {
        status = 0,
        operationType = 'create';
      } else if (targetId == 'modify') {
        status = 0;
        operationType = 'modify';
      } else if (targetId == 'giveup') {
        status = 4;
        operationType = 'giveup';
      } else if (targetId == 'cancel') {
        operationType = 'cancel';
        this.clearTaskContent();
        wx.hideLoading();
        return;
      }

      if (targetId == 'create') {
        let that = this;
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
      } else {
        this.updateTaskToDatabase({
          status: status,
          operationType: operationType,
          success: function (openId, taskId) {
            wx.hideLoading();
            wx.navigateBack();
          }
        })
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
        thumbImg: "",
        needLogin: false,
      });
    },

    //将上传资源生成的fileID，进行管理
    generateMediaListWithMediaFileIDRes: function(mediasRes) {
      if (mediasRes && mediasRes.length > 0) {
        for (const key in mediasRes) {
          const element = mediasRes[key];
          if (element['fileID'].match('plan_0')) {
            this.data.thumbImg = element['fileID'];
          }
          this.data.taskMediaList.push(element['fileID']);
        }
      }
    },

    addGenerateTaskDataToDatabase: function(event) {
      taskInfo.add({
        data: util.convertInnerTaskToDatabaseTask(this.data),
      }).then(res => {
        event.success(res);
      });
    },

    addTaskToDatabase: function(event) {
      //在添加之前，需要使用当前用户已经创建的task数量，计算出当前的taskid
      let that = this;
      this.getTaskInfo({
        success:function(res) {
          that.uploadMedias({
            openId: that.data.openId,
            taskId: that.data.taskId,
            success: function(mediasRes) {
              //将上传资源生成的fileID，进行管理
              that.generateMediaListWithMediaFileIDRes(mediasRes);
  
              that.addGenerateTaskDataToDatabase({
                success: function(addTaskRes) {
                  //在任务状态更新完成的时候，需要将当前任务、以及当前任务的操作行为添加到消息数据库，目前先和积分分开处理，后续搬迁到云函数执行
                  util.addUserOperationMsgWithOperateAndCurrentTaskInfo({
                    operationType: event.operationType,
                    taskInfo: that.data
                  });
                  event.success(addTaskRes);
                },
              })
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
      let that = this;
      util.getCurrentUserNewTaskId({
        success: function(newTaskId) {
          console.log('createTask:', newTaskId);
          that.data.taskId = newTaskId;
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

    //猜一猜相关，登录时，非任务创建者
    p_onGuessPannelClickLogined: function(event) {
      let targetId = event.target['id'];
      let that = this;
      var guessSuccess = false;
      var operationType = '';
      util.getCurrentUserInfo({
        success: function (openId, userInfoRes) {
          if (targetId == 'support') {
            //如果支持的话，将当前用户的openId，加入到支持数据列表
            if (that.data.supportUserList.indexOf(openId) == -1) {
              that.data.supportUserList.push(openId);
              that.data.supportUserAvatarList.push(userInfoRes.data[0].avatarUrl);
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
              that.data.opposeUserAvatarList.push(userInfoRes.data[0].avatarUrl);
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

    //猜一猜相关，未登录时
    p_onGuessPannelClickNotLogined: function(event) {
      //此时需要先拉起登录
      //在登录结束后判断登录的账号，是否为任务用户，如果是，则toast提示，无法支持自己
      //如果不是，则直接调用p_onGuessPannelClickLogined方法
      //此处需要创建popup展示，方便未来登录入口拓展
      console.log('p_onGuessPannelClickNotLogined', event);
      this.showLoginPopup();
    },

    showLoginPopup() {
      this.setData({ loginPopupShow: true });
    },
  
    onLoginPopupClose() {
      this.setData({ loginPopupShow: false });
    },

    //非当前用户，猜一猜相关
    onGuessPannelClick: function (event) {
      let targetId = event.target['id'];
      let that = this;
      var guessSuccess = false;
      var operationType = '';
      //此处需要做用户是否登录判断
      util.isLogin({
        success: function(logined) {
          if (logined) {
            //用户已登录
            that.p_onGuessPannelClickLogined(event);
          } else {
            //用户未登录
            that.p_onGuessPannelClickNotLogined(event);
          }
        }
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
      let that = this;
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
    //制定当前用户、当前任务，进行任务内容的更新
    updateGenerateTaskDataToDatabase: function(event) {
      //制定当前用户、当前任务，进行任务内容的更新
      taskInfo.where({
        openId: this.data.openId,
        taskId: this.data.taskId,
      }).update({
        data: util.convertInnerTaskToDatabaseTask(this.data),
      }).then(taskInfoUpdateRes => {
        event.success(taskInfoUpdateRes)
      });
    },

    updateTaskToDatabase: function (event) {
      let that = this;
      //此处赋值任务状态，是继续进行，还是放弃
      that.data.status = event.status;
      //更新资源信息
      that.uploadMedias({
        openId: that.data.openId,
        taskId: that.data.taskId,
        success: function (mediasRes) {
          //将上传资源生成的fileID，进行管理
          that.generateMediaListWithMediaFileIDRes(mediasRes);
        
          //制定当前用户、当前任务，进行任务内容的更新
          that.updateGenerateTaskDataToDatabase({
            success: function(taskInfoUpdateRes) {
              console.log('taskInfoUpdateRes', taskInfoUpdateRes);
              //在任务状态更新完成的时候，需要将当前任务、以及当前任务的操作行为添加到消息数据库，目前先和积分分开处理，后续搬迁到云函数执行
              util.addUserOperationMsgWithOperateAndCurrentTaskInfo({
                operationType: event.operationType,
                taskInfo: that.data
              });
              //当前任务完成后的回调，具体执行积分计算 和 页面UI收尾工作
              event.success(that.data.openId, that.data.taskId);
            }
          });
        },
        fail: function (err) {
          console.error(err);
        }
      });
    },

    uploadMedias: function (event) {
      //上传媒体信息的时候，如果此次没有对列表进行调整的话，这里无需再次上传
      if (!this.data.taskPlanUploadMediaList 
          && !this.data.taskCompleteUploadMediaList) {
        console.log('no taskPlanUploadMediaList and taskCompleteUploadMediaList')
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
          //此处path拼接规则 openid + taskid + plan/complete + index
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
      var currentTaskUploadMediaList = this.data.taskPlanUploadMediaList;
      if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
        currentTaskUploadMediaList = this.data.taskPlanUploadMediaList;
      } else if (chooseTaskUploadBtnId == 'taskCompleteUploadClick') {
        currentTaskUploadMediaList = this.data.taskCompleteUploadMediaList;
      }
      console.log('chooseImage currentTaskUploadMediaList', currentTaskUploadMediaList);
  
      wx.chooseImage({
        count: 9 - currentTaskUploadMediaList.length,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
      }).then(res => {
        currentTaskUploadMediaList = currentTaskUploadMediaList.concat(res.tempFilePaths);
        let taskShowUpload = (currentTaskUploadMediaList.length < 9) ? true : false;
        // tempFilePath可以作为img标签的src属性显示图片
        if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
          this.data.taskPlanUploadMediaList = currentTaskUploadMediaList;
          this.data.taskPlanShowUpload = taskShowUpload;
          this.setData({
            taskPlanUploadMediaList: this.data.taskPlanUploadMediaList,
            taskPlanShowUpload: this.data.taskPlanShowUpload,
          })
        } else if (chooseTaskUploadBtnId == 'taskCompleteUploadClick') {
          this.data.taskCompleteUploadMediaList = currentTaskUploadMediaList;
          this.data.taskCompleteShowUpload = taskShowUpload;
          this.setData({
            taskCompleteUploadMediaList: this.data.taskCompleteUploadMediaList,
            taskCompleteShowUpload: this.data.taskCompleteShowUpload,
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
      //此处需要根据当前的页面情况来判断
      if (util.validList(this.data.taskMediaList)) {
        //如果当前taskMediaList中有值，说明是已经创建的页面
        //先将已经添加的 加入currentMediaList
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
      }
      //无论taskMediaList中是否有值，均需要从uploadMediaList中找出未生成fileID的资源，需要从当前的'plan''complete'图片数组中取图片http
      var newAddMediaList = [];
      let taskUploadMediaList = [];
      if (type == 'plan') {
        taskUploadMediaList = this.data.taskPlanUploadMediaList;
      } else if (type == 'complete') {
        taskUploadMediaList = this.data.taskCompleteUploadMediaList;
      }
      for (const key in taskUploadMediaList) {
        const element = taskUploadMediaList[key];
        if (element.match('http')) {
          newAddMediaList.push(element);
        }
      }
      currentMediaList = currentMediaList.concat(newAddMediaList);
      
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
      console.log('onShareAppMessage', res)
      if (res.from === 'sharePannel') {
        // 来自页面内转发按钮
        console.log(res.target)
      }
      return {
        title: this.data.taskTitle,
        path: '/pages/taskDetail/taskDetail?share=true&openId='+this.data.openId+'&taskId='+this.data.taskId+'&canJudge='+this.data.canJudge+'&isSelf='+this.data.isSelf,
      }
    },

    onShareBtnClick: function (event) {
      console.log('onShareBtnClick', event);
      this.setData({
        showShare: true
      });
    },

    onSharePannelClose: function (event) {
      console.log('onSharePannelClose', event);
      this.setData({
        showShare: false
      });
    },

    onSharePannelSelect: function (event) {
      console.log('onSharePannelSelect', event);
      let res = {
        from: "sharePannel",
        target: event.detail["icon"]
      };
      this.onShareAppMessage(res);
      this.onSharePannelClose();
    },
  },
})