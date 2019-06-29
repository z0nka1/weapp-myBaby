// miniprogram/pages/query/query.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    queryResult: [],
    hotelNameStr: '',
    reqParams: {
      hotelName: '',
      provinceCode: '',
      cityCode: '',
      areaCode: ''
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

  onHotelInput: function(e) {
    this.data.hotelNameStr = e.detail.value;
  },

  searchHandler: function() {
    this.setData({
      queryResult: [],
      pageIndex: 0,
      noMoreData: false
    });
    this.queryData();
  },

  queryData: function() {
    const db = wx.cloud.database();
    let params = this.data.reqParams;
    for(let key in params){
      if(!params[key]){
        delete params[key];
      }
    }
    if (this.data.hotelNameStr){
      let hotelNameReg = db.RegExp({
        regexp: this.data.hotelNameStr,
        options: 'i'
      });
      params.hotelName = hotelNameReg;
    }else{
      delete params.hotelName;
    }
    wx.showLoading({
      title: '正在搜索...',
      mask: true
    });
    db.collection('hotels')
    .where(params)
    .orderBy('timestamp', 'desc')
    .limit(10).skip(10*this.data.pageIndex)
    .get()
    .then(res => {
      let totalData = this.data.queryResult.concat(res.data);
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

  viewDetail: function (e) {
    let currentHotel = e.currentTarget.dataset['hotel'];
    let state = this.data;

    this.setData({
      currentHotelName: currentHotel.hotelName || '',
      currentHotelAddress: currentHotel.address || '',
      currentHotelRegion: currentHotel.region || '',
      currentHotelDesc: currentHotel.desc || '',
      currentNickName: currentHotel.nickName || '',
      currentAvatarUrl: currentHotel.avatarUrl || '',
      showModal: true,
    });
  },

  onCoverContainerTap: function(){
    this.setData({
      showModal: false
    })
  },
  
  /**
   * 阻止向上冒泡
   */
  catchCoverTap: function(e){
    
  },

  /**
   * 上拉触底事件
   */
  onReachBottom: function(){
    if(this.data.noMoreData){
      return;
    }
    this.queryData();
  }
})