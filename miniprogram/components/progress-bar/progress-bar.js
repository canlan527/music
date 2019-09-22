let movableAreaWidth = 0;
let movableViewWidth = 0;
const backgroundAudioManager = wx.getBackgroundAudioManager();
let currentSec = -1; //表示当前的秒数
let duration = 0//表示当前歌曲的总时长，以秒为单位
let isMoving = false;//设置锁，表示当前进度条是否在拖动，解决当进度条拖动的时候和updatetime事件有冲突的问题
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame:Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0,
    progress: 0,
  },
  //组件的生命周期函数
  lifetimes: {
    ready() {
      //退出重进同一首歌的duration要一样
      if(this.properties.isSame && this.data.showTime.totalTime == '00:00'){
        //如果时间是00：00,表示获取的是同一首歌，重新调用总时间方法
        this._setTime();
      }
      this._getMovableDis(),
      this._bindBGMEvent()
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event){//每次移动的时候获取移动的距离和时间
      if(event.detail.source == 'touch'){//拖动
        //要移动的进度
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x 
        isMoving = true
      }
    },
    onTouchEnd(){//当手松开的时候 把进度条的状态设置上去
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress:this.data.progress,
        movableDis:this.data.movableDis,
        ['showTime.currentTime']:`${currentTimeFmt.min}:${currentTimeFmt.sec}`
      })
      //把当前歌曲设置到规定的进度，参数以秒为单位
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },
    _getMovableDis() {
      const query = this.createSelectorQuery(); //获取当前元素的宽度对象
      //获取.movable-area，.movable-view的宽度信息
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => { //按照获取元素顺序排成数组
        // console.log(rect);
        movableAreaWidth = rect[0].width;
        movableViewWidth = rect[1].width
        // console.log(movableAreaWidth, movableViewWidth)
      })
    },
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        // console.log('onPlay')
        isMoving = false
        this.triggerEvent('musicPlay')
      })
      backgroundAudioManager.onStop(() => {
        // console.log('onStop')
      })
      backgroundAudioManager.onPause(() => {
        this.triggerEvent('musicPause')//组件通信，在player.wxml接收
      })
      backgroundAudioManager.onWaiting(() => {
        // console.log('onWaiting')
      })
      backgroundAudioManager.onCanplay(() => {
        // console.log('onCanplay')
        // console.log(backgroundAudioManager.duration())
        if (typeof backgroundAudioManager.duration !== 'undefined') {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })
      backgroundAudioManager.onTimeUpdate(() => {
        // console.log('onTimeUpdate')
        if(!isMoving){
          const currentTime = backgroundAudioManager.currentTime
          const duration = backgroundAudioManager.duration
          const currentTimeFmt = this._dateFormat(currentTime) //格式化当前时间
          const sec = currentTime.toString().split('.')[0]
          if (sec != currentSec) { //优化，更新不要太频繁，1秒一次
            //设置播放进度
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            currentSec = sec //更新当前秒数
            //联动歌词
            this.triggerEvent('updateTime',{//在调用组件的位置去接收
              currentTime
            })
          }

        }
      })
      backgroundAudioManager.onEnded(() => {
        // console.log('onEnded')
        this.triggerEvent('musicEnd')
      })
      backgroundAudioManager.onError((err) => {
        console.log(err.errMsg)
        console.log(err.errCode)
        wx.showToast({
          title: '错误' + err.errCode,
        })
      })
    },
    _setTime() { //获取歌曲总时长
      duration = backgroundAudioManager.duration;
      const durationFmt = this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    //格式化时间
    _dateFormat(sec) {
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },
    //补零
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    }
  }
})