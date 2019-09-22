let musiclist = [];
let nowPlayingIndx = 0;//正在播放歌曲的index
//获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager();
const app = getApp();//通过小程序自带的方法能调用全局属性、方法
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl:'',
    isPlaying:false ,//false表示不播放 true表示播放
    isLyricShow:false,
    lyric:'',
    isSame:false //表示当前是否是同一首歌曲
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options);   
    nowPlayingIndx = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicId)
  },
  //加载歌曲的数据
  _loadMusicDetail(musicId){
    if (musicId == app.getPlayMusicId()){//当前歌曲的id和传入的id是否是同一个
      this.setData({
        isSame:true
      })
    }else{
      this.setData({
        isSame: false
      })
    }
    if(!this.data.isSame){//如果不是同一首歌曲
      backgroundAudioManager.stop();//加载前先停止上一首
    }
    if (this.data.isSame) {
      this.togglePlaying()
    }
    let music = musiclist[nowPlayingIndx];
    // console.log(music)
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl:music.al.picUrl,
      isPlaying:false
    })
    console.log(musicId, typeof musicId)
    //在数据加载之前，调用全局方法，传入id
    app.setPlayMusicId(musicId);

    wx.showLoading({
      title: '歌曲加载中',
    })
    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId,
        $url:'musicUrl'
      }
    }).then(res=>{
      // console.log(JSON.parse(res.result))
      let result = JSON.parse(res.result);
      if(result.data[0].url == null){//如果是VIP歌曲，用户没有权限 直接返回
        //没有网易云音乐权限，所以获取的地址一定是null
        wx.showToast({
          title: '无权限播放',
        })
        return
      }
      if(!this.data.isSame){//如果不是同一首歌，才获取歌曲相关详细信息
        backgroundAudioManager.title = music.name;
        backgroundAudioManager.src = result.data[0].url;
        backgroundAudioManager.coverImgUrl = music.al.picUrl;
        backgroundAudioManager.singer = music.ar[0].name;
        backgroundAudioManager.epname = music.al.name;

        //保存播放历史
        this.savePlayHistory();
      }
      // if (this.data.isSame) {
      //   backgroundAudioManager.onPlay();
      // }
      this.setData({
        isPlaying:true
      })
      wx.hideLoading()
      //加载歌词
      wx.cloud.callFunction({
        name:'music',
        data:{
          musicId,
          $url: 'lyric'
        }
      }).then(res=>{
        // console.log(res);
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if(lrc){
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
  },
  togglePlaying(){
    if(this.data.isPlaying){
      backgroundAudioManager.pause();
    }else{
      backgroundAudioManager.play();
    }
    this.setData({
      isPlaying:!this.data.isPlaying
    })
  }, 
  onPrev(){
    nowPlayingIndx --;
    if (nowPlayingIndx < 0){
      nowPlayingIndx = musiclist.length-1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndx].id)
  },
  onNext(){
    nowPlayingIndx ++;
    if (nowPlayingIndx > musiclist.length){
      nowPlayingIndx = 0;
    }
    this._loadMusicDetail(musiclist[nowPlayingIndx].id);
  },
  onChangeLyricShow(){
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },
  updateTime(event){
    //选取当前组件，填入对应选择器
    this.selectComponent('.lyric').update(event.detail.currentTime) 
  },
  onPlay(){
    this.setData({
      isPlaying:true
    })
  },
  onPause(){
    this.setData({
      isPlaying: false
    })
  },

  //保存播放历史 
  savePlayHistory(){
    //当前正在播放的歌曲
    const music = musiclist[nowPlayingIndx]
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid)
    let bHave = false
    for(let i = 0,len = history.length; i < len; i++){
      if(history[i].id == music.id){//循环检查歌曲id是否存在相同 如果存在 就不作为
        bHave= true
        break
      }
    }
    if(!bHave){//通过循环结果，如果歌曲id不匹配，则不在列表里
      history.unshift(music) //unshift 在最前面插入一条数据 并返回整个数组
      wx.setStorage({
        key: openid,
        data: history,
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