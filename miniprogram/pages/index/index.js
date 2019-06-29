// //index.js
// const app = getApp()

// Page({
//   data: {
//     logged: false,
//     takeSession: false,
//     requestResult: ''
//   },

//   onLoad: function() {
//     if (!wx.cloud) {
//       wx.showToast({
//         title: '暂不支持云开发',
//         icon: 'none'
//       });
//       return;
//     }

//     // 获取用户信息
//     wx.getSetting({
//       success: res => {
//         // 如果已授权获取用户信息
//         if (res.authSetting['scope.userInfo']){
//           wx.getUserInfo({
//             success: result => {
//               app.globalData.userInfo = result.userInfo;
//             },
//             fail: err => {
//               wx.showToast({
//                 title: '用户信息获取失败'
//               })
//             }
//           })
//         }else{
//           console.log('未授权');
//         }
//       }
//     })
//   },

//   onGetUserInfo: function(e) {
//     // 拒绝授权
//     if (e.detail.errMsg.includes('fail')) {
//       return;
//     }
//     if (!this.logged && e.detail.userInfo) {
//       this.setData({
//         logged: true
//       });
//       app.globalData.userInfo = e.detail.userInfo;
//     }
//     this.goToRegistry();
//   },

//   goToRegistry: function() {
//     wx.navigateTo({
//       url: '../registry/registry',
//     })
//   },

//   goToQuery: function() {
//     wx.navigateTo({
//       url: '../query/query',
//     })
//   }

// })


// miniprogram/pages/query/query.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    queryResult: [],
    remarkStr: '',
    reqParams: {
      remark: ''
    },

    currentHotelName: '',
    currentHotelAddress: '',
    currentHotelRegion: '',
    currentHotelDesc: '',
    currentAvatarUrl: '',
    currentNickName: '',

    showModal: false,
    pageIndex: 0,
    noMoreData: false
  },

  onRemarkInput: function (e) {
    this.data.remarkStr = e.detail.value;
  },

  searchHandler: function () {
    this.setData({
      queryResult: [],
      pageIndex: 0,
      noMoreData: false
    });
    this.queryData();
  },

  queryData: function () {
    const db = wx.cloud.database();
    let params = this.data.reqParams;
    for (let key in params) {
      if (!params[key]) {
        delete params[key];
      }
    }
    if (this.data.remarkStr) {
      let remarkReg = db.RegExp({
        regexp: this.data.remarkStr,
        options: 'i'
      });
      params.remark = remarkReg;
    } else {
      delete params.remark;
    }
    wx.showLoading({
      title: '正在搜索...',
      mask: true
    });
    db.collection('myBaby')
      .where(params)
      .orderBy('createDate', 'desc')
      .limit(10).skip(10 * this.data.pageIndex)
      .get()
      .then(res => {
        console.log(res.data)
        let totalData = this.data.queryResult.concat(res.data);
        totalData.forEach(item => {
          let date = new Date(item.createDate).toLocaleDateString();
          item['date'] = date;
        })
        this.setData({
          queryResult: totalData,
          pageIndex: ++this.data.pageIndex
        });
        wx.hideLoading();
        if (res.data && res.data.length < 10) {
          this.setData({
            noMoreData: true
          })
        }
      }).catch(err => {
        wx.showToast({
          title: '查询出错',
          icon: 'none'
        });
        wx.hideLoading();
        console.log(err)
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryData();
  },

  onCoverContainerTap: function () {
    this.setData({
      showModal: false
    })
  },

  /**
   * 阻止向上冒泡
   */
  catchCoverTap: function (e) {

  },

  /**
   * 上拉触底事件
   */
  onReachBottom: function () {
    if (this.data.noMoreData) {
      return;
    }
    this.queryData();
  },

  previewImage: function(e) {
    const pathList = e.target.dataset.idlist;
    const idx = e.target.dataset.idx;
    wx.previewImage({
      urls: pathList,
      current: pathList[idx]
    })
  },

  onPullDownRefresh: function() {
    this.setData({
      queryResult: [],
      pageIndex: 0,
      noMoreData: false
    });
    this.queryData();
  }
})