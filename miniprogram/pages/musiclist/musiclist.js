// pages/musiclist/musiclist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    musiclist:[],
    listInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    // console.log(typeof (options.playlistId) +' :' + options.playlistId);//会打印相关的歌单id，通过id去云音乐的API接口里面获取到这个id歌单里的所有歌曲信息，调用对应的云函数
    wx.cloud.callFunction({      
      name:'music',
      data:{
        playlistId: options.playlistId,//传入参数 对应的歌单id
        $url:'musiclist'//获取云函数中间件
      }
    }).then(res=>{
      const pl = res.result.playlist
      this.setData({
        musiclist:pl.tracks,//当前歌单对应的歌曲的信息
        listInfo:{
          coverImgUrl: pl.coverImgUrl,
          name:pl.name
        }
      })
     this._setMusiclist();//存到本地
      wx.hideLoading()
    })
  },
  _setMusiclist(){//将获取到到歌曲详细信息等存到本地存储里
    wx.setStorageSync('musiclist', this.data.musiclist)

  }
})