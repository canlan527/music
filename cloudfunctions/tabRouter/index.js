// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router');//加载tab-router模块对象，名字就是json里的依赖名
cloud.init()

// 云函数入口函数event里面有天然的鉴权机制 可以获取openid
exports.main = async (event, context) => {
  //演示tabRouter
  const app = new TcbRouter({event});//1.用app来实例化对象，传入对应参数event,tab就会自动帮我们去处理事件中的参数和转发
  //3.开始业务逻辑代码：需求获取两个个函数内用户的open-id，音乐信息，电影信息，提取公共需求openid
  app.use(async (ctx, next)=>{
    console.log('进入全局中间件')
    //如果想要王小程序端返回值的话，定义ctx.data
    ctx.data={}//先赋空值，一会赋值在返回小程序端
    ctx.data.openId = event.userInfo.openId//通过event的天然鉴权机制，ctx获取到了openid
    await next()//获取完openid后还要获取音乐信息和电影信息，所以调用next，把每个中间件进行关联，next里面可能是个异步操作，所以加个await
    console.log('退出全局中间件')
  })
  
  //4.定义music路由,'music'表示中间件的名字，表示只适用music这个路由
  app.router('music',async(ctx, next)=>{
    console.log('进入音乐名称中间件')
    ctx.data.musicName = '寂寞寂寞就好'//如果获取完歌名以后，还要在下一个中间件里获取类型
    await next()//调用next  
    console.log('退出音乐名称中间件')
  },async (ctx, next)=>{//传入类型中间件
    console.log('进入音乐类型中间件')
    ctx.data.musicType = '华语流行'//获取类型完成，中间件任务完成，可以返回
    ctx.body = {
      data:ctx.data//将获取的数据都传入body里面才行
    }
    console.log('退出音乐类型中间件')
    
  })

  //5.定义movie路由，思路同上
  app.router('movie', async (ctx, next)=>{
    console.log('进入电影名称中间件')    
    ctx.data.movieName = '武状元苏乞儿'
    await next()
    console.log('退出电影名称中间件')

  },async (ctx, next)=>{
    console.log('进入电影类型中间件')
    ctx.data.movieType = '港台经典'
    ctx.body = {
      data: ctx.data
    }
    console.log('退出电影类型中间件')
  })

  //try
  app.router('musiclist', async (ctx, next) => {
    ctx.body = await cloud.database().collection('playlist').get()
      .then((res) => {
        return res
      }).catch(err=>{
        console.error(err)
      })
  })


  //2.最后，把当前的服务给返回，这句话是一定要有的
  return app.serve()

}