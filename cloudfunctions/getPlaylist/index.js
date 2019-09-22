// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
//初始化云数据库
const db = cloud.database();
//引入request第三方请求库
const rp = require('request-promise');
//引入服务器接口
const URL = 'http://musicapi.xiecheng.live/personalized';
const playlistCollection = db.collection('playlist'); //歌曲
const MAX_LIMIT = 100;
// 云函数入口函数
exports.main = async(event, context) => {
  //突破云函数每次查询能有有100条的限制
  let list = { //存放promise对象
    data: []
  }
  //获取总条数 -> number  limit
  const countResult = await playlistCollection.count();
  const countTotal = countResult.total
  const batchTimes = Math.ceil(countTotal / MAX_LIMIT)
  let tasks = []; //存放分批的数据
  for (let i = 0; i < batchTimes; i++) {
    let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }

  const playlist = await rp(URL).then(res => {
    return JSON.parse(res).result
  }).catch(err => {
    console.error(err);
  });
  //去重 对比
  let newData = []; //记录去重过的数据
  for (let i = 0, len1 = playlist.length; i < len1; i++) {
    let flag = true; //记录id是否重复，true是不重复
    for (let j = 0, len2 = list.data.length; j < len2; j++) {
      if (playlist[i].id === list.data[j].id) {
        flag = false;
        break;
      }
    }
    if (flag) { //都是不重复的，放到新数组里
      newData.push(playlist[i])
    }
  }
  for (let i = 0, len = newData.length; i < len; i++)
    await playlistCollection.add({
      data: {
        ...newData[i],
        creatTime: db.serverDate(),
      }
    }).then(res => {
      console.log('插入成功')
    }).catch(err => {
      console.error('插入失败')
    })
  return newData.length
}