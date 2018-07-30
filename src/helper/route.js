const fs = require('fs')
const promisify = require('util').promisify
const stat = promisify(fs.stat)
const path = require('path')
const readdir = promisify(fs.readdir)
const handlebars = require('handlebars')
const conf = require('../config/defaultConfig')
const mime = require('../config/mime')
const compress = require('../config/compress')

const tplPath = path.join(__dirname, '../model/dir.tpl')
const source = fs.readFileSync(tplPath)
const template = handlebars.compile(source.toString())

module.exports = async function (req, res, filePath) {
    try {
        const stats = await stat(filePath)
        if(stats.isFile()) {
            const contentType = mime(filePath)
            res.statusCode = 200
            res.setHeader('Content-Type', contentType)
            const rs = fs.createReadStream(filePath)
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