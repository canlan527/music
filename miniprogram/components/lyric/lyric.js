let lyricHeight = 0;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow:{
      type:Boolean,
      value:false
    },
    lyric:String
  },
  //定义监听器
  observers:{
    lyric(lrc){
      // console.log(lrc)
      if(lrc == '暂无歌词'){
        this.setData({
          lrcList:[{
            lrc,
            time:0
          }],
          nowLyricIndex:-1
        })
      }else{
        this._parseLyric(lrc);
      }
      
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: 0, //当前选中的下标
    scorllTop:0  
  },
  lifetimes:{
    ready(){
      wx.getSystemInfo({
        success(res){
          console.log(res)
          lyricHeight = res.screenWidth / 750 * 64
        }
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime){
      // console.log(currentTime)
      let lrcList = this.data.lrcList
      if (lrcList.length == 0){
        return 
      }
      //进行更严谨的判断
      if (currentTime > lrcList[lrcList.length - 1].time) {
        if (this.data.nowLyricIndex != -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }
      for (let i = 0, len = lrcList.length; i < len; i++) {
        if (currentTime <= lrcList[i].time) {
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight
          })
          break
        }
      }

    },
    _parseLyric(sLyric){
      //通过换行取到每一行的歌词
      let line = sLyric.split('\n');
      // console.log(line);
      let _lrcList = [];
      //循环每一行，通过正则表达式取出
      line.forEach(ele=>{
        let time = ele.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)//得到了时间
        // console.log(time)
        if(time != null){
          let lrc = ele.split(time)[1]//得到了歌词
          // console.log(lrc)
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // console.log(timeReg);
          //把时间转换成秒
          let time2Sec = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            lrc,
            time:time2Sec
          })
          // console.log(_lrcList)
        }
      })
      this.setData({
        lrcList: _lrcList
      })
      
    }
  }
})
