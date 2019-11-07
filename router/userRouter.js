const Router = require('koa-router')
const User = require('../model/user')
const Comment = require('../model/comment')
// jwt
const jwt = require('jsonwebtoken')
const auth = async (ctx, next) => {
  const { authorization = '' } = ctx.request.header
  const token = authorization.replace('Bearer ', '')
  try {
    const user = jwt.verify(token, 'aaa')
    ctx.state.user = user
  } catch (err) {
    ctx.body = { meta: { msg: "没有权限", status: 403 }, data: err }
    return;
  }
  await next()
}

// 前缀
const userRouter = new Router({ prefix: '/users' })
// $route GET /api/users/test
// @desc 返回json
// @access public
userRouter.get('/test', async (ctx) => {
  ctx.body = { testf: 'ok' }
})
// $route POST /api/users/register
// @desc 注册用户
userRouter.post('/register', async (ctx) => {
  ctx.verifyParams({
    name: { type: 'string', required: true },
    password: { type: 'string', required: true }
  })
  const { name } = ctx.request.body
  const reuser = await User.findOne({ name: name })
  if (reuser) {
    ctx.body = { meta: { msg: "用户名重复", status: 409 }, data: reuser }
    return;
  }
  const user = await new User(ctx.request.body).save()
  ctx.body = { meta: { msg: "ok", status: 200 }, data: user }
})
// $route POST /api/users/login
// @desc  登陆用户
userRouter.post('/login', async (ctx) => {
  ctx.verifyParams({
    name: { type: 'string', required: true },
    password: { type: 'string', required: true }
  })

  const user = await User.findOne(ctx.request.body)
  if (!user) {
    ctx.body = { meta: { msg: "用户名或密码错误", status: 500 }, data: user }
    return;
  }
   const { _id, name } = user
    const token = jwt.sign({ _id, name },'aaa',{expiresIn:3600})

  ctx.body = { meta: { msg: "ok", status: 200 }, data:{user,token:`Bearer ${token}`} }
})
// $route GET /api/users/
// @desc  获取用户列表 分页
userRouter.get('/', async (ctx) => {
  let pagesize = ctx.query.pagesize
  let pagenumber = ctx.query.pagenumber
  const count = await User.find()
  const user = await User.find().skip(pagesize * (pagenumber - 1)).limit(pagesize*1)
  ctx.body = { meta: { msg: "ok", count:count.length, status: 200 }, data: user }
})
// $route GET /api/users/search
// @desc  根据用户名搜索用户
userRouter.get('/search', async (ctx) => {
  const user = await User.find()
  let reuser = user.filter((item) => {
    return -1 != item.name.indexOf(ctx.query.name)
  })
  ctx.body = { meta: { msg: "ok", status: 200 }, data: reuser }
})
// $route GET /api/users/:id
// @desc  获取指定用户用户
userRouter.get('/:id', async (ctx) => {
  const user = await User.findById(ctx.params.id)
  if (!user) {
    ctx.body = { meta: { msg: "用户不存在", status: 404 }, data: user }
    return;
  }
  ctx.body = { meta: { msg: "ok", status: 200 }, data: user }
})
// $route PUT /api/users/:id
// @desc  编辑用户
userRouter.put('/:id', async (ctx) => {
  const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
  if (!user) {
    ctx.body = { meta: { msg: "用户不存在", status: 404 }, data: user }
    return;
  }
  ctx.body = { meta: { msg: "ok", status: 200 }, data: user }
})
// $route DElETE /api/users/:id
// @desc  删除用户
userRouter.delete('/:id', async (ctx) => {
  const user = await User.findByIdAndRemove(ctx.params.id)
  if (!user) {
    ctx.body = { meta: { msg: "用户不存在", status: 404 }, data: user }
    return;
  }
  ctx.body = { meta: { msg: "删除成功", status: 204 }, data: user }
})

// $route POST /api/users/:uid/talks/:tid
// @desc 用户评论该帖子
userRouter.post('/:uid/talks/:tid', async (ctx) => {
 
  const user = await new Comment({tId:ctx.params.tid,uId:ctx.params.uid,...ctx.request.body}).save()
  ctx.body = { meta: { msg: "ok", status: 200 }, data: user}
})
// $route POST /api/users/:uid/talks/:tid/:mid
// @desc 用户回复评论
userRouter.post('/:uid/talks/:tid/:mid', async (ctx) => {
 
  const user = await new Comment({tId:ctx.params.tid,uId:ctx.params.uid,mId:ctx.params.mid,...ctx.request.body}).save()
  ctx.body = { meta: { msg: "ok", status: 200 }, data: user}
})
// $route DELETE /api/users/zhoux
// @desc 删除所有评论
userRouter.delete('/zhoux/c', async (ctx) => {
 
  const user = await  Comment.deleteMany()
  ctx.body = { meta: { msg: "ok", status: 200 }, data: user}
})
// $route GET /api/users/:uid/talks
// @desc 获取用户评论该帖子
userRouter.get('/:uid/talks', async (ctx) => {
 
  const user = await  Comment.find({uId:ctx.params.uid})
  ctx.body = { meta: { msg: "ok", status: 200 }, data: user}
})
module.exports = userRouter.routes()