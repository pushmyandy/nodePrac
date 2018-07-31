const {cache} = require('../config/defaultConfig')

function refresh(stats, res) {
    const maxAge = cache.maxAge, expires = cache.expires,
        cacheControl = cache.cacheControl, lastModified = cache.lastModified,
        etag = cache.etag

    if (expires) {
        res.setHeader('Expires', (new Date(Date.now() + maxAge * 1000)).toUTCString())

    }
    if (cacheControl) {
        res.setHeader('Cache-Control', `public, max-age = ${maxAge}`)
    }
    if (lastModified) {
        res.setHeader('Last-Modified', stats.mtime.toUTCString())
    }
    if (etag) {
        res.setHeader('Etag', `${stats.size}-${stats.mtime}`)
    }
}
module.exports = function isFresh(stats, req, res) {
    refresh(stats, res)
    const lastModified = req.headers['if-modified-since']
    const etag = req.headers['if-none-match']

    if(!lastModified && !etag) {
        return false
    }
    if(lastModified && lastModified!==res.getHeader('Last-Modified')) {
        return false
    }
    if(etag && etag!==res.getHeader('Etag')) {
        return false
    }
    return true
}