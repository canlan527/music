module.exports = (date) => {
  let fmt = 'yyyy-MM-dd hh:mm:ss'; //定义期待的格式
  let dateObj = {
    'M+': date.getMonth() + 1, //月份，+代表一次或多次
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分钟
    's+': date.getSeconds() //秒
  }
  //正则匹配fmt
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, date.getFullYear())
  }
  // console.log(fmt)//2019-MM-dd hh-mm-ss
  for (let prop in dateObj) {
    if (new RegExp('(' + prop + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, dateObj[prop].toString().length == 1 ? '0' + dateObj[prop] : dateObj[prop])
    }
  }
  return fmt
}