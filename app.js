import React from 'react'
import ReactDom from 'react-dom'
// import Koa from 'koa'
// import mount from 'koa-mount'
// import convert from 'koa-convert'
// import Router from 'koa-router'
// const bodyParser = require('koa-bodyparser')
require('babel-register')
var xlsx = require('node-xlsx')
const Router = require('koa-router')
// const constructGetDb = require('mongodb-auto-reconnect')
// import cors from 'koa-cors'
import constructGetDb from 'mongodb-auto-reconnect'
const Koa = require('koa')
const app = new Koa()
// const Router = new Router()
const router = new Router()
// router.use(bodyParser())
const MONGO_URL = 'mongodb://psychological:psychological-ruqi@localhost:27017/Psychological'
const getDb = constructGetDb(MONGO_URL)

router.get('/healthcheck', ctx => {
  ctx.body = 'OK'
})

router.get('/getData', async ctx => {
  const db = await getDb()
  const data = await db.collection('questions').aggregate([
    {
      $project: { sn: 1, subject: 1, option: 1, category: 1 }
    },
    {
      $group: {
        _id: { "subject": "$subject" },
        "answer": { $push: { "sn": "$sn", "option": "$option", "category": "$category" }},
      }
    },
    { $sort: { "answer.sn": 1 }}
  ]).toArray()
  const categoryKeys = await db.collection('questions').distinct('category')
  const result = data.map(item => {
    const answerRecords = []
    item.answer.forEach(ans => {
      answerRecords.push({
        sn: ans.sn,
        option: ans.option,
        category: ans.category,
      })
    })
    return {
      subject: item._id.subject,
      answers: answerRecords,
    }
  })
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
