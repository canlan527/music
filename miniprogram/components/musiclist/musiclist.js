const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1//当前组件内部播放的id
  },
  //组件生命周期
  pageLifetimes:{
    show(){
      this.setData({
        playingId:parseInt(app.getPlayMusicId())//在组件被展示的时候获取到当前播放歌曲的id
      })
      
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(event){
      const ds = event.currentTarget.dataset
      const musicid = ds.musicid
      this.setData({
        playingId:musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicid}&index=${ds.index}`,
      })
    }
  }
})
