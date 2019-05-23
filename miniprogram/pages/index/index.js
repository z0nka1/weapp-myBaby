//index.js
const app = getApp()

Page({
  data: {
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.showToast({
        title: '暂不支持云开发',
        icon: 'none'
      });
      return;
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        // 如果已授权获取用户信息
        if (res.authSetting['scope.userInfo']){
          wx.getUserInfo({
            success: result => {
              app.globalData.userInfo = result.userInfo;
            },
            fail: err => {
              wx.showToast({
                title: '用户信息获取失败'
              })
            }
          })
        }else{
          console.log('未授权');
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    // 拒绝授权
    if (e.detail.errMsg.includes('fail')) {
      return;
    }
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true
      });
      app.globalData.userInfo = e.detail.userInfo;
    }
    this.goToRegistry();
  },

  goToRegistry: function() {
    wx.navigateTo({
      url: '../registry/registry',
    })
  },

  goToQuery: function() {
    wx.navigateTo({
      url: '../query/query',
    })
  }

})
