// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow:Boolean
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
    onGetUserInfo(event){
      // console.log(event.detail)
      let userInfo = event.detail.userInfo
      if (userInfo){
        this.triggerEvent('loginSucceed', userInfo)
      }else{
        console.log('triggerfali')
        this.triggerEvent("loginFailed")
      }
    }
  }
})
