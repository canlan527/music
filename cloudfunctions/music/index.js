// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')//引入tcb-router
const rp = require('request-promise')//引入第三方发送请求库
const BASE_URL = 'http://musicapi.xiecheng.live'//发送的url
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  //使用TcbRouter
  const app = new TcbRouter({
    event
  })

  app.router('playlist', async (ctx, next) => {
    ctx.body = await cloud.database().collection('playlist')
      .skip(event.start)
      .limit(event.count)
      .orderBy('creatTime', 'desc')
      .get()
      .then((res) => {
        return res
      })
  })
  app.router('musiclist', async (ctx, next) => {
    ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId))
      .then((res) => {
        // console.log(event.playlistId)
        return JSON.parse(res)
      })
  })
  //获取歌曲url
  app.router('musicUrl', async (ctx, next)=>{
    ctx.body = await rp(BASE_URL + `/song/url?id=${event.musicId}`)
    .then(res=>{
      return res
    })
  })
  //获取歌词
  app.router('lyric', async(ctx, next)=>{
    ctx.body = await rp(BASE_URL + `/lyric?id=${event.musicId}`)
    .then(res=>{
      return res
    })
  })
  
  return app.serve()
}