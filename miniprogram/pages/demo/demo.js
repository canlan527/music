// miniprogram/pages/demo/demo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  //获取用户openid和音乐信息
  getMusicInfo(){
    wx.cloud.callFunction({
      name:'tabRouter',
      data:{
        $url:'music'//通过配置data.$url来指定传入的是哪个路由
      }
    }).then(res=>{
      console.log(res)
    })
  },
  //获取用户openid和电影信息
  getMovieInfo(){
    wx.cloud.callFunction({
      name:'tabRouter',
      data:{
        $url: 'movie'
      }
    }).then(res=>{
      console.log(res)
    })
  },
  getMusiclist() {
    wx.cloud.callFunction({
      name: 'tabRouter',
      data: {
        $url: 'musiclist'
      }
    }).then(res => {
      console.log(res)
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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