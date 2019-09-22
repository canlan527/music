// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlist:{
      type:Object
    }
  },
  //数据监视器
  observers:{
    ['playlist.playCount'](count){//监控playCount
      // console.log(count);
      // console.log(this._transNum(count, 2));//转换playcount，取2位小数
      this.setData({
        _count: this._transNum(count, 2)
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _count:0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //点击跳转到musiclist页面
    goToMusiclist() {
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,
      })
    },
    _transNum(count, point){//自定义转换playCount函数
      //Number转String
      let strNum = count.toString().split('.')[0];//去小数点前面的数值
      //转万、亿
      if (strNum.length < 6){
        return strNum
      } else if (strNum.length >= 6 && strNum.length<=8 ){
        let decimal = strNum.substring(strNum.length - 4, strNum.length - 4 + point );
        return parseFloat( parseInt(strNum / 10000) + '.' + decimal) + '万'
      } else if (strNum.length >8) {
        let decimal = strNum.substring(strNum.length - 8, strNum.length - 8 + point);
        return parseFloat(parseInt(strNum / 100000000) + '.' + decimal) + '亿'
      }
    }
  }
})
