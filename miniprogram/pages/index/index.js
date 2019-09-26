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
    noMoreData: false,
    loading: false
  },

  onRemarkInput: function (e) {
    this.data.remarkStr = e.detail.value;
  },

  searchHandler: function () {
    this.refresh();
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
    this.setData({
      loading: true
    })
    db.collection('myBaby')
      .where(params)
      .orderBy('createDate', 'desc')
      .limit(10).skip(10 * this.data.pageIndex)
      .get()
      .then(res => {
        console.log(res.data)
        let totalData = this.data.queryResult.concat(res.data);
        totalData.forEach(item => {
          let date = new Date(item.createDate);
          let minutes = date.getMinutes();
          if (date) {
            item.date = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${minutes > 9 ? minutes : '0' + minutes}`;
          }
        })
        this.setData({
          queryResult: totalData,
          pageIndex: ++this.data.pageIndex,
          loading: false,
          noMoreData: res.data && res.data.length < 10
        });
        wx.hideLoading();
      }).catch(err => {
        wx.showToast({
          title: '查询出错',
          icon: 'none'
        });
        this.setData({
          loading: false
        })
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
    this.refresh();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000)
  },

  refresh: function() {
    this.setData({
      queryResult: [],
      pageIndex: 0,
      noMoreData: false
    });
    this.queryData();
  },

  onShareAppMessage: function(e) {
    return {
      title: '小语|成长瞬间',
      imageUrl: '../../images/cover.png'
    }
  },

  onLongPress: function(e) {
    const db = wx.cloud.database();
    const id = e.currentTarget.dataset.id;
    const that = this;
    wx.showModal({
      title: '提示',
      content: '确定删除该记录？',
      success: (res) => {
        if (res.confirm) {
          db.collection('myBaby').doc(id).remove()
          .then(res => {
            let data = this.data.queryResult;
            data = data.filter(item => item._id !== id);
            that.setData({
              queryResult: data
            });
            wx.showToast({
              title: '删除成功',
            })
          }).catch(err => {
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          })
        }
      }
    })
  }
})