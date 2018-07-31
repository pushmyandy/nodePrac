const fs = require('fs')
const promisify = require('util').promisify
const stat = promisify(fs.stat)
const path = require('path')
const readdir = promisify(fs.readdir)
const handlebars = require('handlebars')
const mime = require('./mime')
const compress = require('./compress')
const range = require('./range')
const cache = require('./cache')

const tplPath = path.join(__dirname, '../model/dir.tpl')
const source = fs.readFileSync(tplPath)
const template = handlebars.compile(source.toString())

module.exports = async function (req, res, filePath, conf) {
    try {
        const stats = await stat(filePath)
        if(stats.isFile()) {
            const contentType = mime(filePath)
            res.setHeader('Content-Type', contentType)
            if(cache(stats, req, res)) {
                res.statusCode = 304
                res.end()
                return
            }
            let rs
            const {code, start, end} = range(stats.size, req, res)
            if(code === 200){
                res.statusCode = 200
                rs = fs.createReadStream(filePath)
            } else {
                res.statusCode = 206
                rs = fs.createReadStream(filePath, {
                    start,
                    end
                })
            }
            if (filePath.match(conf.compress)) {
                res = compress(rs, req, res)
            }
            rs.pipe(res)
        } else if(stats.isDirectory()) {
            const files = await readdir(filePath) // 不加await返回一个Promise对象
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            const dir = path.relative(conf.root, filePath) // 一个文件相对于另一个文件的相对路径
            const data = {
                title: path.basename(filePath),
                dir: dir ? `/${dir}` : '',
                files: files.map(file => {
                    return {
                        file,
                        icon: mime(file)
                    }
                })
            }
            res.end(template(data))
        }
    } catch (e) {
        res.statusCode = 404
        res.setHeader('Content-Type', 'text/plain')
        res.end(`${e}`)
    }
}