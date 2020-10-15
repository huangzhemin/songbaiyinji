// components/taskComponents/taskDetailUploadMediaPosterComponents/taskDetailUploadMediaPosterComponents.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    propertyUploadMediaPosterList: {
      type: Array,
      value: [],
    },
    propertyPageInfoUploadImageWidth: {
      type: Number,
      value: 1,
    }, 
    propertyPageInfoUploadImageHeight: {
      type: Number,
      value: 1,
    }, 
    propertyPageInfoUploadImageSpacing: {
      type: Number,
      value: 1,
    },
    propertyUploadType: {
      type: String,
      value: "",
    },
    propertyExchangeFirstSelectIndex: {
      type: Number,
      value: -1,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    uploadMediaPosterList: [],
    pageInfoUploadImageWidth: 1,
    pageInfoUploadImageHeight: 1,
    pageInfoUploadImageSpacing: 1,
    uploadType: "",
    exchangeFirstSelectIndex: -1,
  },

  observers: {
    'propertyUploadMediaPosterList, propertyPageInfoUploadImageWidth, propertyPageInfoUploadImageHeight, propertyPageInfoUploadImageSpacing, propertyUploadType, propertyIsExchangingMedia, propertyExchangeFirstSelectIndex': function (propertyUploadMediaPosterList, propertyPageInfoUploadImageWidth, propertyPageInfoUploadImageHeight, propertyPageInfoUploadImageSpacing, propertyUploadType, propertyIsExchangingMedia, propertyExchangeFirstSelectIndex) {
      console.log('uploadType', propertyUploadType);
      this.setData({
        uploadMediaPosterList: propertyUploadMediaPosterList,
        pageInfoUploadImageWidth:this.getValidUploadImageDataLength(propertyPageInfoUploadImageWidth),
        pageInfoUploadImageHeight:this.getValidUploadImageDataLength(propertyPageInfoUploadImageHeight),
        pageInfoUploadImageSpacing:this.getValidUploadImageDataLength(propertyPageInfoUploadImageSpacing),
        uploadType:propertyUploadType,
        exchangeFirstSelectIndex:propertyExchangeFirstSelectIndex,
      });
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // taskCompleteUploadMediaPosterList
    getValidUploadImageDataLength:function(dataLength) {
      return dataLength != undefined ? dataLength : 1;
    },

    deleteMedia: function (event) {
      this.triggerEvent('taskDetailUploadDeleteMedia', event);
    },

    mediaPicClick: function(event) {
      this.triggerEvent('mediaPicClickEvent', event);
    }
  }
})
