const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    region: [],
    provinceCode: '',
    cityCode: '',
    areaCode: '',
    provinceName: '',
    cityName: '',
    areaName: ''
  },

  onRegionChange: function(e){
    let codeArr = e.detail.code;
    let nameArr = e.detail.value;
    this.setData({
      region: nameArr,
      provinceCode: codeArr[0] || '',
      cityCode: codeArr[1] || '',
      areaCode: codeArr[2] || '',
      provinceName: nameArr[0] || '',
      cityName: nameArr[1] || '',
      areaName: nameArr[2] || ''
    });
  },

  registry: function(e) {
    let formData = e.detail.value;
    let data = this.data;
    if(!data.region.length){
      wx.showToast({
        title: '请选择省市区',
        icon: 'none'
      });
      return;
    }
    let infoObj = {
      address: '请填写详细地址',
      hotelName: '请填写酒店名称',
      desc: '请填写问题描述'
    }
    for(let k in infoObj){
      if(!formData[k]){
        wx.showToast({
          title: infoObj[k],
          icon: 'none'
        });
        return;
      }
    }
    const db = wx.cloud.database();
    delete this.data.__webviewId__;
    this.setData({
      loading: true
    });
    let now = new Date();
    let timestamp = now.getTime();
    let registryDate = `${now.getFullYear()}/${+now.getMonth() + 1}/${now.getDate()}`;
    let avatarUrl = app.globalData.userInfo.avatarUrl;
    let nickName = app.globalData.userInfo.nickName;
    let obj = {
      timestamp: timestamp,
      registryDate: registryDate,
      avatarUrl: avatarUrl,
      nickName: nickName
    }
    let params = Object.assign({}, this.data, formData, obj);
    delete params.loading;
    db.collection('hotels').add({
      data: params,

      success: res => {
        wx.showToast({
          title: '登记成功',
        });
        this.setData({
          loading: false
        });
        setTimeout(() => {
          wx.redirectTo({
            url: '../query/query',
          })
        }, 300);
        const args = {
          formId: e.detail.formId
        }
        this.dispatchTemplateMessage(args);
      },

      fail: err => {
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

  dispatchTemplateMessage: function(e) {
    wx.cloud.callFunction({
      name: 'templateMessage',
      data: {
        formId: e.formId,
      }
    })
  }
})