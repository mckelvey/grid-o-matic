
'use strict'

http = require 'http'
fs = require 'fs'
path = require 'path'

env = require __dirname + '/config/env'
express = require __dirname + '/config/express'

server = http.createServer(express)

### Page/Static Responses ###

pattern = []
for staticItem in fs.readdirSync(env.server.staticPath)
  item = fs.statSync "#{env.server.staticPath}/#{staticItem}"
  staticItem += '/' if item.isDirectory()
  pattern.push staticItem.replace('.', '\\.').replace('/', '\\/')
pattern = new RegExp('^\\/(?!' + pattern.join('|') + ')', '')

handlePage = (page, response) ->
  fs.lstat path.join(__dirname, 'views', 'pages', "#{page}.jade"), (err, stats) ->
    if err?
      if page.substr(-5) isnt 'index'
        return handlePage "#{page}/index", response
      else
        return response.status(404).render('errors/404', { basedir: path.join(__dirname, 'views') })
    response.render "pages/#{page}", { basedir: path.join(__dirname, 'views') }

express.get pattern,
  (req, res) ->
    return res.redirect(301, req.url.replace(/\/+$/, '')) if req.url isnt '/' and req.url.substr(-1) is '/'
    staticHTML = path.join(env.server.staticPath, req.url, "index.html")
    fs.lstat staticHTML, (err, stats) ->
      if err?
        handlePage req.url, res
      else
        res.sendfile staticHTML

server.listen(env.server.port)
