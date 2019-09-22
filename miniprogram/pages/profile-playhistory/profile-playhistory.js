const app = getApp()//获取全局
Page({

  /**
   * 页面的初始数据
   */
  data: {
    musicList :[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const playHistory = wx.getStorageSync(app.globalData.openid)
    if(playHistory == ''){
      wx.showModal({
        title: '暂无本地播放记录',
        content: '',
      })
    }else{
      //storage里面存储的musiclist替换成播放历史里的数据
      wx.setStorage({
        key: 'musiclist',
        data: playHistory,
      })
      this.setData({
        musicList:playHistory
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})