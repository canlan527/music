// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const TcbRouter = require('tcb-router')
const db = cloud.database()//初始化数据库
const blogCollection = db.collection('blog')
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})
  
  app.router('list',async(ctx, next)=>{
    const keyword = event.keyword
    let whereObj = {}//定义查询对象
    if(keyword.trim()!=''){//模糊查询
      whereObj={//'i'代表忽略大小写，'m'代表匹配换行 's'让点可以匹配换行符在内的所有字符
        content: new db.RegExp({
          regexp:keyword,
          options: 'i'
        })
      }
    }
    //定义博客列表+模糊查询where(查询条件)
    let blogList = await blogCollection.where(whereObj).skip(event.start).limit(event.count)
      .orderBy('createTime','desc').get()
      .then(res=>{
        return res.data
      })
    ctx.body = blogList;
  })

  //博客详情
  app.router('detail', async(ctx, next)=>{
    //详情查询1->n(1)

    let blogId = event.blogId
    let detail = await blogCollection.where({
      _id:blogId
    }).get().then(res=>{
      return res.data
    })

    //评论查询1->N(N)
    const countResult = await blogCollection.count()
    const total = countResult.total
    let commentList = {
      data:[]
    }
    if(total > 0){
      const batchTimes = Math.ceil(total / MAX_LIMIT)
      const task=[]
      for(let i = 0; i < batchTimes; i ++){
        let promise = cloud.database().collection('blog-comment').skip(i * MAX_LIMIT).limit(MAX_LIMIT)
          .where({ blogId }).orderBy('createTime','desc').get()
        task.push(promise)
      }
      if(task.length > 0){
       commentList = (await Promise.all(task)).reduce((acc, cur)=>{
         return {
           data: acc.data.concat(cur.data)
         }
       })
      }
    }
    ctx.body = {
      commentList,
      detail
    }
  })
  //查询数据库
  const wxContext = cloud.getWXContext()
  app.router('getListByOpenid', async(ctx, next)=>{
   ctx.body = await blogCollection.where({
      _openid:wxContext.OPENID
    }).skip(event.start).limit(event.count)
    .orderBy('createTime', 'desc').get()
    .then(res=>{
      return res.data
    })
  })


  return app.serve()
}