// import Koa from 'koa'
// import mount from 'koa-mount'
// import convert from 'koa-convert'
// import Router from 'koa-router'
// const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')
// import constructGetDb from 'mongodb-auto-reconnect'
// import cors from 'koa-cors'
// import constructGetDb from 'mongodb-auto-reconnect'
const Koa = require('koa')
const app = new Koa()
// const Router = new Router()

const router = new Router()
// router.use(bodyParser())

router.get('/healthcheck', ctx => {
  ctx.body = 'OK'
})

app.use(async (ctx) => {
  ctx.body = 'Hello World222'
})
app.use(router.routes()).use(router.allowedMethods())
app.listen(3000)