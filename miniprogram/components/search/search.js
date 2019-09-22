let keyword = ''
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder:{
      type:String,
      value:'请输入关键字'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(event){
      keyword = event.detail.value
    },
    onSearch(){
      // console.log(keyword);
      //把keyword抛到blog，让调用方接收
      this.triggerEvent('search',{
        keyword
      })
      console.log('www')
    }
  }
})
