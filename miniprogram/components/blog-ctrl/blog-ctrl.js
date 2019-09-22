let userInfo = {}
const db=wx.cloud.database()//小程序端初始化数据库
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId:String,
    blog: Object
  },
  //接收外部iconfont样式
  externalClasses: ['iconfont', 'icon-fenxiang','icon-pinglun'],
  /**
   * 组件的初始数据
   */
  data: {
    loginShow:false,//登录组件是否显示
    modalShow:false,//底部弹出评论框
    content:'',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){
      //判断用户是否授权
      wx.getSetting({
        success:(res)=>{
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({//引入授权组件
              success:(res)=>{
                userInfo = res.userInfo
                //显示评论弹出层
                this.setData({
                  modalShow:true
                })
              }
            })
          }else{
            this.setData({
              loginShow:true,
            })           
          }
        }
      })     
    },
    onLoginSucceed(event) {
      userInfo = event.detail 
      //授权框消失 ，评论框显示
      this.setData({
        loginShow:false
      },()=>{//第二个参数
        this.setData({
          modalShow:true
        })
      })
    },
    onLoginFailed() {
      wx.showModal({
        title: '只有授权用户才能评论',
        content: '',
      })
      this.setData({
        loginShow: true
      })
    },
    // onInput(event) {
    //   this.setData({
    //     content: event.detail.value
    //   })
    // },
    onSend(event){
      console.log(event)
      //插入云数据库
      // let content = this.data.content;
      let content = event.detail.value.content;
      let formId = event.detail.formId
      if(content.trim() == ''){//如果内容为空
        wx.showModal({
          title: '评论内容不能为空',
          content: '',
        })
        return
      }
      wx.showLoading({
        title: '评价中',
        mask:true
      })
      //获取头像、昵称、openid、时间
      db.collection('blog-comment').add({
        data:{
          content,
          createTime:db.serverDate(),
          blogId:this.properties.blogId,
          nickName:userInfo.nickName,
          avatarUrl:userInfo.avatarUrl
        }
      }).then(res=>{
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modalShow:false,
          content:''
        })
        //父元素刷新评论页面
        this.triggerEvent('refreshCommentList')
      })
      //给用户推送模板消息
      wx.cloud.callFunction({
        name:'sendMessage',
        data:{
          content,
          formId,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
        }
      }).then(res=>{
        console.log(res)
      })
    },
    
  }
})
