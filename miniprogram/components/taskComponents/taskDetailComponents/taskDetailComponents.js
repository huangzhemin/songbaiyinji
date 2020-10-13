// components/taskComponents/taskDetailComponents/taskDetailComponents.js
const db = wx.cloud.database()
const taskInfo = db.collection('taskInfo')
const util = require('../../../util.js');

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
    taskPlanUploadMediaPosterList: [], //记录计划展示的mediaList的外显样式，这里主要为了处理视频的展示问题
    taskPlanShowUpload: true,

    taskCompleteDesc: "",
    taskCompleteUploadMediaList: [],
    taskCompleteUploadMediaPosterList: [], //记录完成展示的mediaList的外显样式，这里主要为了处理视频的展示问题
    taskCompleteShowUpload: true,

    taskMediaAndThumbDic: {},
    taskMediaAndMediaFileIdDic: {},

    taskMediaList: [],
    supportUserList: [],
    supportUserAvatarList: [],
    opposeUserList: [],
    opposeUserAvatarList: [],

    isSelf: false,
    needLogin: false,
    showShare: false,
    loginPopupShow: false,

    pageInfo: {
      uploadImageWidth: 1,
      uploadImageHeight: 1,
      uploadImageSpacing: 1,
    },

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

      //在每次打开页面的时候，需要根据当前设备信息，计算当前展示的页面信息
      //包括设备尺寸，展示缩略图的尺寸
      this.p_caculatePageInfo();
      //通过传入的OpenId和taskId，展示当前的任务详情页
      this.p_taskDetailShowWithOpenIdAndTaskId(propertyOpenId, propertyTaskId);
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    p_caculatePageInfo: function() {
      let that = this;
      wx.getSystemInfo({
        success (res) {
          let windowWidth = res['windowWidth'];
          //此处因为在布局上采用vantLayout，width被均分为24份
          //起步的布局是在第1份，中间有22份的空间，图片与图片之间保持0.5的间距
          let unitWidth = windowWidth / 24.0;
          that.setData({
            ['pageInfo.uploadImageWidth']: unitWidth * 7,
            ['pageInfo.uploadImageHeight']: unitWidth * 7,
            ['pageInfo.uploadImageSpacing']: unitWidth * 0.5,
          });
        }
      });
    },

    p_taskDetailShowWithOpenIdAndTaskId: function(propertyOpenId, propertyTaskId) {
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

    createTaskPage: function(event) {
      this.setData({
        openId: this.data.openId,
        isSelf: true,
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
      console.log('userLoginAndGetUserInfo', event.detail.userInfo);
      console.log('userLoginAndGetUserInfo before openId, taskId', that.properties);
      //通过用户信息，刷新页面
      util.userLoginAndGetUserInfo({
        userInfo: event.detail.userInfo,
        success: function(currentOpenId, latestUserInfo) {
          //通过返回的当前用户openId，直接更新登录状态和刷新页面
          if (util.validStr(currentOpenId)) {
            console.log('userLoginAndGetUserInfo', currentOpenId, latestUserInfo)
            //此处需要根据 当前的具体来源，做不同的操作
            //刷新页面
            //此处需要根据taskDetail.js传入的onLoadOptions的具体参数，来判断展示
            //外部传值，恒定，不管onLoad以是吗方式拉起，分享拉起，还是列表点击进入，传入的数据propertyOpenId 和 propertyTaskId都是参考
            console.log('userLoginAndGetUserInfo openId, taskId', that.properties);
            that.data.openId = util.validList(that.properties.propertyOpenId) ? that.properties.propertyOpenId : currentOpenId;
            that.data.taskId = that.properties.propertyTaskId;
            that.p_taskDetailShowWithOpenIdAndTaskId(that.data.openId, that.data.taskId);
          }
        }
      });
    },

    componentLoadPage: function (event) {
      let that = this;
      util.getCurrentUserOpenId({
        success: function(openId) {
          that.p_componentLoadPage(openId == that.properties.propertyOpenId);
        },
        fail: function(err) {
          that.p_componentLoadPage(false);
        }
      });
    },

    p_componentLoadPage: function(isSelf) {
      console.log('p_componentLoadPage isSelf', isSelf);
      console.log('p_componentLoadPage data', this.data)
      wx.showLoading({
        title: 'loading...',
      })
      let that = this;
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
          isSelf: isSelf, //是否是用户自身，是结合当前使用用户，外部传入属性，不受数据库数据影响
          supportUserList: that.data.supportUserList,
          opposeUserList: that.data.opposeUserList,
          supportUserAvatarList: that.data.supportUserAvatarList.slice(0, 10),
          opposeUserAvatarList: that.data.opposeUserAvatarList.slice(0, 10),
          taskPlanDesc: that.data.taskPlanDesc,
          taskPlanUploadMediaList: that.data.taskPlanUploadMediaList,
          taskPlanUploadMediaPosterList: that.p_generatePreviewMediaList(that.data.taskPlanUploadMediaList),
          taskCompleteDesc: that.data.taskCompleteDesc,
          taskCompleteUploadMediaList: that.data.taskCompleteUploadMediaList,
          taskCompleteUploadMediaPosterList: that.p_generatePreviewMediaList(that.data.taskCompleteUploadMediaList),
          needLogin: false,
          loginPopupShow: false,
        });
        wx.hideLoading();
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
            setTimeout(() => {
              wx.hideLoading();
              wx.switchTab({
                url: '/pages/tabbar/task/task',
              })
            }, 500);
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
        taskPlanUploadMediaPosterList: [],
        taskPlanShowUpload: true,
        taskCompleteDesc: "",
        taskCompleteUploadMediaList: [],
        taskCompleteUploadMediaPosterList: [],
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
          const mediaElementRes = mediasRes[key];
          if (util.validDic(mediaElementRes)) {
            //只有当返回的字典有效时，才加入taskMediaList
            //主要用来处理视频伴随的缩略图上传，会在上传成功时，人为调整返回结果为{}，只保存视频与缩略图的映射关系
            this.data.taskMediaList.push(mediaElementRes['fileID']);  
          }
        }
      }
      
      this.data.thumbImg = '';
      if (util.validList(this.data.taskMediaList)) {
        var thumbImg = '';
        for (const key in this.data.taskMediaList) {
          const validMedia = this.data.taskMediaList[key];
          let type = this.p_getMediaTypeWithUrl(validMedia);
          thumbImg = this.p_getMediaPosterIfNeeded(type, 
            validMedia);
          //如果缩略图有效的话，则结束循环
          if (util.validStr(thumbImg)) {
            break;
          }
        }
        this.data.thumbImg = thumbImg;
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
              //清理自己的反对票
              let opposeIndex = that.data.opposeUserList.indexOf(openId);
              if (opposeIndex != -1) {
                that.data.opposeUserList.splice(opposeIndex, 1);
                that.data.opposeUserAvatarList.splice(opposeIndex, 1);
              }
              //更新
              that.setData({
                supportUserList: that.data.supportUserList,
                supportUserAvatarList: that.data.supportUserAvatarList,
                opposeUserList: that.data.opposeUserList,
                opposeUserAvatarList: that.data.opposeUserAvatarList,
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
              //清理自己的反对票
              let supportIndex = that.data.supportUserList.indexOf(openId);
              if (supportIndex != -1) {
                that.data.supportUserList.splice(supportIndex, 1);
                that.data.supportUserAvatarList.splice(supportIndex, 1);
              }
              //更新
              that.setData({
                opposeUserList: that.data.opposeUserList,
                opposeUserAvatarList: that.data.opposeUserAvatarList,
                supportUserList: that.data.supportUserList,
                supportUserAvatarList: that.data.supportUserAvatarList,
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
              }
            })
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
      let that = this;
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
        //在批量上传结束的时候，更新taskMediaAndMediaFileIdDic
        //将现有的存储在 taskMediaAndThumbDic 中的原数据url ：poster url（OLD）
        //通过 taskMediaAndMediaFileIdDic 映射替换成为新的fileID字典 （原fileID：poster fileID）(NEW)
        this.p_updateMediaAndMediaFileIdDic();
        event.success(result);
      });
    },

    p_updateMediaAndMediaFileIdDic: function() {
      //创建(NEW) key value映射
      let taskMediaAndThumbKeys = Object.keys(this.data.taskMediaAndThumbDic);
      taskMediaAndThumbKeys.forEach(oldKey => {
        //获取(OLD) key value具体值
        let oldValue = this.data.taskMediaAndThumbDic[oldKey];
        console.log('test oldKey oldValue', oldKey, oldValue);
        //通过(OLD) 获取(NEW) key value具体值
        let fileIDKey = this.data.taskMediaAndMediaFileIdDic[oldKey];
        let fileIDValue = this.data.taskMediaAndMediaFileIdDic[oldValue];
        //此处需要加fileIDKey 和 fileIDValue的判断逻辑
        //只有当taskMediaAndMediaFileIdDic中可以找到oldKey|oldValue对应的fileIDKey，fileIDValue时，才对原有的taskMediaAndThumbDic做调整（包括添加newKey:newValue，删除oldKey:oldValue）
        if (util.validStr(fileIDKey) && util.validStr(fileIDValue)) {
          console.log('test newKey newValue', fileIDKey, fileIDValue);
          //将获取到的(NEW)key value存入到taskMediaAndThumbDic中
          console.log('test taskMediaAndThumbDic stage1', this.data.taskMediaAndThumbDic);
          this.data.taskMediaAndThumbDic[fileIDKey] = fileIDValue;
          console.log('test taskMediaAndThumbDic stage2', this.data.taskMediaAndThumbDic);
          //删除(OLD) key value映射
          delete this.data.taskMediaAndThumbDic[oldKey];
          console.log('test taskMediaAndThumbDic stage3', this.data.taskMediaAndThumbDic);
        }
      });
    },

    p_generateNewMediaIdWithUploadMediaList: function(uploadMediaList) {
      var newMediaId = '';
      var generateComplete = false;
      while (!generateComplete) {
        newMediaId = Math.ceil(Math.random() * 100);
        console.log('newMediaId', newMediaId);
        for (const key in uploadMediaList) {
          const element = uploadMediaList[key];
          if (element.match('_'+newMediaId+'.')) {
            console.log('conflict', newMediaId, uploadMediaList);
            generateComplete = false;
            break;
          } else {
            generateComplete = true;
          }
        }
      }
      return newMediaId;
    },

    p_getMediaFileSuffix: function(filePath) {
      var num = filePath.lastIndexOf('.') ;
      var fileSuffix = filePath.substr(num);
      return fileSuffix;
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
        //上传主体资源文件
        //此处path拼接规则 openid + taskid + plan/complete + index
        let openId = event.openId;
        let taskId = event.taskId;
        let taskfileFolder = openId + '_' + taskId;  //当前任务的文件夹
        let newMediaId = this.p_generateNewMediaIdWithUploadMediaList(uploadMediaList);
        let mediaSuffix = this.p_getMediaFileSuffix(filePath);
        let userMediaCloudPathMainPath = taskfileFolder + '/'
                                       + openId + '_'
                                       + taskId + '_'
                                       + type + '_'
                                       + newMediaId;
        let userMediaCloudPath = userMediaCloudPathMainPath
                               + mediaSuffix; //此处需要结合用户登录态的openid，随机函数也需要优化
        console.log('userMediaCloudPath filePath', 
                    userMediaCloudPath, filePath);
        let promise = new Promise((resolve, reject) => {
          wx.cloud.uploadFile({
            cloudPath: userMediaCloudPath,
            filePath: filePath,
          }).then(res => {
            // get resource ID
            // 绑定资源文件 与 上传后的fileID
            console.log('taskMediaAndMediaFileIdDic res', this.data.taskMediaAndMediaFileIdDic, res['fileID']);
            this.data.taskMediaAndMediaFileIdDic[filePath] = res['fileID'];
            resolve(res);
          }).catch(err => {
            // handle error
            console.error(err)
            reject(err);
          });
        });
        this.data.promiseArr.push(promise);

        //上传缩略图文件
        //这里如果上传的资源为视频资源，则需讲缩略图一并上传
        let mediaType = this.p_getMediaTypeWithUrl(filePath);
        let thumbImgUrl = this.p_getMediaPosterIfNeeded(mediaType, 
          filePath);
        let thumbImgSuffix = this.p_getMediaFileSuffix(thumbImgUrl);
        //判断条件为，thumbImgUrl有效，同时满足缩略图url与基础资源的url不同
        if (util.validStr(thumbImgUrl) && thumbImgUrl != filePath) {
          //将缩略图资源拼接为url，并上传
          //此处path拼接规则 openid + taskid + plan/complete + index
          let userMediaThumbCloudPath = userMediaCloudPathMainPath 
                                        + thumbImgSuffix; //此处需要结合用户登录态的openid，随机函数也需要优化
          console.log('userMediaThumbCloudPath, filePath', userMediaThumbCloudPath, filePath);

          let promiseThumb = new Promise((resolve, reject) => {
            wx.cloud.uploadFile({
              cloudPath: userMediaThumbCloudPath,
              filePath: thumbImgUrl,
            }).then(res => {
              // 绑定缩略图文件url 与 上传后的fileID
              this.data.taskMediaAndMediaFileIdDic[thumbImgUrl] = res['fileID'];
              // resolve(res);
              console.log('original res', res);
              resolve({});
            }).catch(err => {
              // handle error
              console.error(err)
              reject(err);
            });
          });
          this.data.promiseArr.push(promiseThumb);
        }
      }
    },

    chooseMedia: function (event) {
      let chooseTaskUploadBtnId = event.currentTarget["id"];
      var currentTaskUploadMediaList = this.data.taskPlanUploadMediaList;
      if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
        currentTaskUploadMediaList = this.data.taskPlanUploadMediaList;
      } else if (chooseTaskUploadBtnId == 'taskCompleteUploadClick') {
        currentTaskUploadMediaList = this.data.taskCompleteUploadMediaList;
      }
      console.log('chooseMedia currentTaskUploadMediaList', currentTaskUploadMediaList);
  
      wx.chooseMedia({
        count: 9 - currentTaskUploadMediaList.length,
        sizeType: ['original', 'compressed'],
        mediaType: ['image','video'],
        sourceType: ['album', 'camera'],
        maxDuration: 30,
        camera: 'back',
      }).then (res => {
        console.log(res);
        //整理filePath到tempFilePaths中，等待上传
        var tempFilePaths = [];
        for (const key in res.tempFiles) {
          const element = res.tempFiles[key];
          tempFilePaths.push(element.tempFilePath);
          //此处将element.tempFilePath作为key（具体资源）
          //element.thumbTempFilePath作为value（缩略图）
          this.data.taskMediaAndThumbDic[element.tempFilePath] = element.thumbTempFilePath != undefined ? element.thumbTempFilePath : element.tempFilePath;
        }
        console.log('tempFilePaths', tempFilePaths);
        console.log('taskMediaAndThumbDic', this.data.taskMediaAndThumbDic);
        //将tempFilePaths加入上传列表中
        console.log('currentTaskUploadMediaList before', currentTaskUploadMediaList);
        currentTaskUploadMediaList = currentTaskUploadMediaList.concat(tempFilePaths);
        console.log('currentTaskUploadMediaList after', currentTaskUploadMediaList);
        //检查当前展示数是否超过最大值
        let taskShowUpload = (currentTaskUploadMediaList.length < 9) ? true : false;
        // tempFilePath可以作为img标签的src属性显示图片
        if (chooseTaskUploadBtnId == 'taskPlanUploadClick') {
          //点击任务计划资料上传
          this.data.taskPlanUploadMediaList = currentTaskUploadMediaList;
          this.data.taskPlanShowUpload = taskShowUpload;
          this.setData({
            taskPlanUploadMediaList: this.data.taskPlanUploadMediaList,
            taskPlanUploadMediaPosterList: this.p_generatePreviewMediaList(this.data.taskPlanUploadMediaList),
            taskPlanShowUpload: this.data.taskPlanShowUpload,
          })
        } else if (chooseTaskUploadBtnId == 'taskCompleteUploadClick') {
          //点击任务完成资料上传
          this.data.taskCompleteUploadMediaList = currentTaskUploadMediaList;
          this.data.taskCompleteShowUpload = taskShowUpload;
          this.setData({
            taskCompleteUploadMediaList: this.data.taskCompleteUploadMediaList,
            taskCompleteUploadMediaPosterList: this.p_generatePreviewMediaList(this.data.taskCompleteUploadMediaList),
            taskCompleteShowUpload: this.data.taskCompleteShowUpload,
          });
        }
      }).catch(err => {
        console.error(err)
      })
    },

    deleteMedia: function (event) {
      let that = this;
      util.getCurrentUserOpenId({
        success: function(openId) {
          //如果成功，则将当前用户的openId与传入的propertyOpenId对比，判断是否为当前用户，只有当前用户可以删除自己
          console.log('openId', openId);
          console.log('propertyOpenId', that.properties.propertyOpenId);
          if (openId == that.properties.propertyOpenId) {
            that.p_deleteMedia(event);
          }
        },
        fail: function(err) {
          //如果失败，则说明当前用户未登录，不可能有删除图片的能力
          return;
        }
      });
    },

    p_deleteMedia: function (event) {
      if (util.getCurrentStatusTypeWithStatus(this.data.status) != 'doing') {
        return;
      }
      console.log('deleteImage');
      let that = this;
      wx.showModal({
        title: '提示',
        content: '确定要删除吗？',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            that.p_confirmDeleteMedia(event);
          }
        }
      })
    },

    p_confirmDeleteMedia: function(event) {
      console.log('event', event);
      //定位
      let deleteType = event.target.dataset.type;
      let sourceUrl = event.target.dataset.url;
      console.log('deleteType', deleteType);
      console.log('sourceUrl', sourceUrl);

      this.p_deleteMediaWithSourceUrl(deleteType, sourceUrl);
    },

    p_deleteMediaWithSourceUrl: function(deleteType, sourceUrl) {
      //删除已上传部分
      if (util.validList(this.data.taskMediaList)) {
        console.log('taskMediaList before taskMediaList', this.data.taskMediaList);
        this.p_deleteMediaWithMediaListAndSourceUrl(this.data.taskMediaList, sourceUrl);
        console.log('taskMediaList after taskMediaList', this.data.taskMediaList);  
      }
      
      //删除展示部分
      if (deleteType == 'plan') {
        console.log('plan before taskPlanUploadMediaList', this.data.taskPlanUploadMediaList);
        this.p_deleteMediaWithMediaListAndSourceUrl(this.data.taskPlanUploadMediaList, sourceUrl);
        console.log('plan after taskPlanUploadMediaList', this.data.taskPlanUploadMediaList);
        //更新UI
        this.setData({
          taskPlanUploadMediaList: this.data.taskPlanUploadMediaList,
          taskPlanUploadMediaPosterList: this.p_generatePreviewMediaList(this.data.taskPlanUploadMediaList),
        });
      } else if (deleteType == 'complete') {
        console.log('complete before taskCompleteUploadMediaList', this.data.taskCompleteUploadMediaList);
        this.p_deleteMediaWithMediaListAndSourceUrl(this.data.taskCompleteUploadMediaList, sourceUrl);
        console.log('complete after taskCompleteUploadMediaList', this.data.taskCompleteUploadMediaList);
        //更新UI
        this.setData({
          taskCompleteUploadMediaList: this.data.taskCompleteUploadMediaList,
          taskCompleteUploadMediaPosterList: this.p_generatePreviewMediaList(this.data.taskCompleteUploadMediaList),
        });
      }
    },

    p_deleteMediaWithMediaListAndSourceUrl: function(mediaList,  sourceUrl) {
      let deleteIndex = mediaList.indexOf(sourceUrl)
      if (deleteIndex != -1) {
        mediaList.splice(deleteIndex, 1);
      }
    },

    previewMedia: function (event) {
      let dataset = event.target.dataset;
      var type = dataset['type'];
      var index = dataset['index'];
      var currentMediaList = [];
      console.log('currentMediaList before', currentMediaList);
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
        //此处很神奇，模拟器为http://tmp/xxx
        //真机为wxfile://tmp_xxx
        //所以选择://tmp作为公共部分
        if (element.match('://tmp')) {
          newAddMediaList.push(element);
        }
      }
      currentMediaList = currentMediaList.concat(newAddMediaList);
      console.log('currentMediaList after', currentMediaList);

      wx.previewMedia({
        current: index, // 当前选中的资源
        sources: this.p_generatePreviewMediaList(currentMediaList) // 需要预览的图片http链接列表
      });
    },

    p_generatePreviewMediaList: function(currentMediaList) {
      var preViewMediaList = [];
      console.log('currentMediaList', currentMediaList);
      for (const key in currentMediaList) {
        const url = currentMediaList[key];
        let type = this.p_getMediaTypeWithUrl(url);
        let element = {
          url: url,
          type: type,
          poster: this.p_getMediaPosterIfNeeded(type, url),
        }
        preViewMediaList.push(element);
      }
      console.log('preViewMediaList', preViewMediaList);
      return preViewMediaList;
    },

    p_getMediaTypeWithUrl: function(url) {
      let suffix = this.p_getMediaFileSuffix(url);
      var mediaType = 'image';
      //后续观察视频格式，出现不兼容的再添加
      if (suffix == '.mp4' || suffix == '.m3u8') {
        mediaType = 'video';
      }
      return mediaType;
    },

    p_getMediaPosterIfNeeded: function(type, url) {
      var posterUrl = url;
      if (type == 'video') {
        console.log('taskMediaAndThumbDic', this.data.taskMediaAndThumbDic);
        console.log('url', url);
        posterUrl = this.data.taskMediaAndThumbDic[url];
      }
      console.log('type', type, posterUrl);
      return posterUrl;
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
        path: '/pages/taskDetail/taskDetail?share=true&openId='+this.data.openId+'&taskId='+this.data.taskId,
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