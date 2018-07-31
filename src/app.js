const http = require('http')
const conf = require('./config/defaultConfig')
const path = require('path')
const route = require('./helper/route')

class Server {
    constructor (config) {
        this.conf = Object.assign({}, conf, config)
    }
    start () {
        const server = http.createServer((req, res) => {
            const url = req.url
            const filePath = path.join(conf.root, url)
            route(req, res, filePath, this.conf)
        })

        server.listen(conf.port, conf.hostname, ()=>{
            const addr = `http://${conf.hostname}:${conf.port}`
            console.log(`Server run at ${addr}`)
        })
    }
}

module.exports = Server

