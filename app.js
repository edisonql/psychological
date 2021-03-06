// import convert from 'koa-convert'
import cors from 'koa2-cors'
import map from 'lodash/map'
require('babel-register')
var xlsx = require('node-xlsx')
const Router = require('koa-router')
import constructGetDb from 'mongodb-auto-reconnect'
const Koa = require('koa')
const app = new Koa()
const router = new Router()
const MONGO_URL = 'mongodb://psychological:psychological-ruqi@localhost:27017/Psychological'
const getDb = constructGetDb(MONGO_URL)
const bodyParser = require('koa-bodyparser')

// app.use(cors({
//     origin: function (ctx) {
//         // if (ctx.url === '/test') {
//         //     return "*"; // 允许来自所有域名请求
//         // }
//         return '*'
//     },
//     exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
//     maxAge: 5,
//     credentials: true,
//     allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
//     allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
// }))
app.use(cors())
app.use(bodyParser())

router.get('/healthcheck', ctx => {
  ctx.body = 'OK'
})

router.post('/saveResult', async ctx => {
  const { data } = ctx.request.body
  // console.log(data.paperResult)
  const queryStringModule = require('querystring');
  let params = queryStringModule.parse(data);//解析数据 获得Json对象
  // console.log(typeof params.paperResult)
  // map(JSON.stringify(params.paperResult), (value, key) => {
  //   console.log(key, '---', value)
  // })
  // const urlModule = require('url')
  // let params = urlModule.parse(ctx.url, true).query // 解析数据 获得Json对象
  // let value = params.key // 通过参数名称获得参数值
  // console.log(params);
  // // console.log(JSON.stringify(params))
  // // const { paperResult } = params
  // // console.log(paperResult)
  // const paperResult =
  const db = await getDb()
  await db.collection('results').insert({ ...params, createdAt: new Date() })
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.response.body = 'OK'
})

router.get('/getData', async ctx => {
  console.log('get data')
  const db = await getDb()
  const data = await db.collection('questions').aggregate([
    {
      $project: { sn: 1, subject: 1, option: 1, category: 1 }
    },
    {
      $group: {
        _id: { "sn": "$sn", "subject": "$subject" },
        "answer": { $push: { "option": "$option", "category": "$category" }},
      }
    },
    { $sort: { "_id.sn": 1 }}
  ]).toArray()
  const categoryKeys = await db.collection('questions').distinct('category')
  const result = data.map(item => {
    const answerRecords = []
    item.answer.forEach(ans => {
      answerRecords.push({
        // sn: item._id.sn,
        option: ans.option,
        category: ans.category,
      })
    })
    return {
      sn: item._id.sn,
      subject: item._id.subject,
      answers: answerRecords,
    }
  })
  // ctx.set('Access-Control-Allow-Credentials', 'true')
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.response.body = {result, categoryKeys}
})

router.get('/prepareDataByExcel', async ctx => {
  const db = await getDb()
  const obj = xlsx.parse(__dirname+'/MBTI量表（20180509）.xlsx')
  const excelObj = obj[0].data
  const data = []
  const header = ['sn', 'subject', 'option', 'category']
  for (var i in excelObj) {
      var arr = []
      var value = excelObj[i]
      const item = {}
      for (var j in value) {
          item[header[j]] = value[j]
      }
      await db.collection('questions').insert(item)
  }
})

router.get('/test', async ctx => {
  console.log(__dirname)
  const db = await getDb()
  const data = await db.collection('questions').find({}).toArray()
  ctx.response.body = data
})
app.use(router.routes()).use(router.allowedMethods())
app.use(async (ctx) => {
  ctx.body = 'OK'
})
app.listen(3001, () => console.log('the app was runing on prot 3001'))
