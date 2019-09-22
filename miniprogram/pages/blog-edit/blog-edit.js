const MAX_WORDS_NUM = 280;
const MAX_IMG_NUM = 9
const db = wx.cloud.database()//初始化云数据库
let content = ''//博客的内容文字
let userInfo={}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum:0,
    footerBottom:0,
    images:[],
    selectPhoto:true,//添加图片元素是否显示
  },

  onInput(event){
    // console.log(event.detail.value);
    let wordsNum = event.detail.value.length;
    if (wordsNum >= MAX_WORDS_NUM){
      wordsNum = '最大字数为' + MAX_WORDS_NUM
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },
  onFocus(event) {//模拟器获取的键盘高度为0
    this.setData({
      footerBottom:event.detail.height
    })
  },
  onBlur(event){
    this.setData({
      footerBottom:0
    })
  },
  onChooseImg(){
    let max =  MAX_IMG_NUM - this.data.images.length//能选几张
    wx.chooseImage({
      count:max,
      sizeType:['original','compressed'],
      sourceType:['album','camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths//tempFilePath可以作为img标签的src属性显示图片
        console.log(tempFilePaths)

        this.setData({
          images: this.data.images.concat(tempFilePaths)
        })
        //选择一次以后还能再选几张
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      },
    })
  },
  onDelImg(event){
    //要删除图片 ，先知道点的是那一张，取到对应的索引
    // event.target.dataset.index//通过这个方法取到自定义的索引
    //如何在指定数组里通过索引来删除对应元素-->arr.splice(index,删除的个数)，然后会返回被删的数组，因此
    let imgs = this.data.images
    imgs.splice(event.target.dataset.index, 1)
    this.setData({
      images: imgs
    })
    if (imgs.length == MAX_IMG_NUM - 1){
      this.setData({
        selectPhoto:true
      })
    }
  },
  onPreviewImg(event){//预览图片
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    })
  },
  send(){
   
    //2.数据->云数据库
    //数据库：内容，图片fileID、openid、昵称、头像、时间
    //1.图片->云存储 fileID 云文件ID
    if(content.trim() == ''){
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return
    }
    wx.showLoading({
      title: '发布中...',
      mask:true
    })
    let promiseArr=[];
    let fileIds = [];
    for(let i = 0; i < this.data.images.length; i ++){
      let p =  new Promise((resolve,reject)=>{
        let item = this.data.images[i];
        //正则匹配图片后缀
        let suffix = /\.\w+$/.exec(item)[0];
        //图片上传:因为文件只支持单文件上传，所以要遍历来将多图上传
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 100000000 + suffix,
          filePath: item,
          success: (res) => {
            console.log(res.fileID) ;
            fileIds=fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    //存数据库
    Promise.all(promiseArr).then(res=>{
      db.collection('blog').add({
        data:{
          ...userInfo,
          content,
          img:fileIds,
          createTime:db.serverDate()//服务端时间
        }
      }).then(res=>{
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        //返回博客列表,并刷新
        //调用另一个页面的方法
        wx.navigateBack()
        const pages = getCurrentPages();
        // console.log(pages);
        //取到上一个页面
        const prevPage = pages[pages.length-2]
        prevPage.onPullDownRefresh()

      })
    }).catch(err=>{
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    userInfo = options
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