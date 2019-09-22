//app.js
App({
  onLaunch: function () {
    // this.checkUpate()
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'test-ekjdz',
        traceUser: true,
      })
    }
    this.getOpenid()
    this.globalData = {
      playingMusicId:-1,//设置全局属性，任意页面都能访问到
      openid:-1
    }
  },
  setPlayMusicId(musicId) {//通过这个方法对playingMusicId赋值
    this.globalData.playingMusicId = musicId
  },
  getPlayMusicId(){//获取musicId，只要调用这两个方法就能使用全局属性
    return this.globalData.playingMusicId
  },
  getOpenid(){
    wx.cloud.callFunction({
      name:'login'
    }).then(res=>{
      const openid = res.result.openid 
      this.globalData.openid = openid
      if(wx.getStorageSync(openid) == ''){//如果之前没有openid，再初始化
        wx.setStorageSync(openid, [])        
      }
    })
  },
  checkUpate() {
    const updateManager = wx.getUpdateManager()
    // 检测版本更新
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用',
            success(res) {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
  },
})