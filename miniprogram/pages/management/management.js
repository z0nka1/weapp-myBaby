const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    remark: '',
    imageIDList: [],
    videoIDList: [],
    tempImagePaths: [],
    tempVideoPaths: []
  },

  submitHandler: function (e) {
    if (!this.data.imageIDList.length && !this.data.videoIDList.length) {
      return;
    }
    const formData = e.detail.value;
    const db = wx.cloud.database();
    const now = new Date();
    const timestamp = now.getTime();
    // const avatarUrl = app.globalData.userInfo.avatarUrl;
    // const nickName = app.globalData.userInfo.nickName;
    const obj = {
      createDate: timestamp,
      // avatarUrl: avatarUrl,
      // nickName: nickName
    }
    delete this.data.__webviewId__;
    let params = Object.assign({}, this.data, formData, obj);
    delete params.loading;
    this.setData({
      loading: true
    });
    wx.showLoading({
      title: '请稍候...',
    });
    db.collection('myBaby').add({
      data: params,
      
      success: res => {
        wx.hideLoading();
        wx.showToast({
          title: '提交成功',
        });
        this.setData({
          loading: false,
          remark: '',
          imageIDList: [],
          videoIDList: [],
          tempImagePaths: [],
          tempVideoPaths: []
        });
        setTimeout(() => {
          wx.switchTab({
            url: '../index/index'
          })
        }, 300);
        const args = {
          formId: e.detail.formId
        }
      },

      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: `oops！出错了：${err}`,
          icon: 'none'
        });
        this.setData({
          loading: false
        });
      }
    })
  },

  dispatchTemplateMessage: function (e) {
    wx.cloud.callFunction({
      name: 'templateMessage',
      data: {
        formId: e.formId,
      }
    })
  },

  chooseImage: function () {
    let list = this.data.imageIDList;
    let tempPath = this.data.tempImagePaths;
    const that = this;
    wx.chooseImage({
      success: function(res) {
        const files = res.tempFilePaths;
        tempPath = [...tempPath, ...files];
        for (let i = 0; i < files.length; i++) {
          const pathList = files[i].split('.');
          wx.cloud.uploadFile({
            filePath: files[i],
            cloudPath: pathList[2] + '' + pathList[3],
            success: res => {
              list.push(res.fileID);
              that.setData({
                imageIDList: list,
                tempImagePaths: tempPath
              });
              wx.showToast({
                title: '图片上传成功',
              })
            },
            fail: err => {
              wx.showToast({
                title: '图片上传失败',
                icon: 'none'
              });
              console.log(err);
            }
          })
        }
      },
      fail: function(err) {
        wx.showToast({
          title: err.errMsg || '选择图片时出错',
          icon: 'none'
        })
      }
    })
  },

  onRemarkInput: function (e) {
    this.data.remark = e.detail.value;
  },

  chooseVideo: function () {
    let list = this.data.videoIDList;
    let tempPath = this.data.tempVideoPaths;
    const that = this;
    wx.chooseVideo({
      success: function (res) {
        const path = res.tempFilePath;
        const thumbTempFilePath = res.thumbTempFilePath;
        const cloudPath = path.split('.');
        tempPath = [...tempPath, {temPath: path, thumb: thumbTempFilePath}];
        wx.cloud.uploadFile({
          filePath: path,
          cloudPath: cloudPath[2] + '' + cloudPath[3],
          success: res => {
            list.push(res.fileID);
            that.setData({
              videoIDList: list,
              tempVideoPaths: tempPath
            });
            wx.showToast({
              title: '视频上传成功',
            })
          },
          fail: err => {
            wx.showToast({
              title: '视频上传失败',
              icon: 'none'
            });
            console.log(err);
          }
        })
      },
      fail: function (err) {
        wx.showToast({
          title: err.errMsg || '选择视频时出错',
          icon: 'none'
        })
      }
    })
  },

  onShareAppMessage: function (e) {
    return {
      title: '爸比&妈咪倾情奉献',
      imageUrl: '../../images/pink_panther.png'
    }
  }
})