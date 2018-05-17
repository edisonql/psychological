import React from 'react'
import ReactDom from 'react-dom'
// import Koa from 'koa'
// import mount from 'koa-mount'
// import convert from 'koa-convert'
// import Router from 'koa-router'
// const bodyParser = require('koa-bodyparser')
require('babel-register')
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

router.get('/test', async ctx => {
  console.log(__dirname)
  const db = await getDb()
  // console.log(db)
  const data = await db.collection('questions').find({}).toArray()
  console.log(data)
  ctx.response.body = data
})
app.use(router.routes()).use(router.allowedMethods())

app.use(async (ctx) => {
  ctx.body = 'OK'
})
app.listen(3001, () => console.log('the app was runing on prot 3001'))
