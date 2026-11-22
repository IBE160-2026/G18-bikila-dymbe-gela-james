// Serves a built dist folder with gzip, as Vercel does, so a local build can be measured with mal-ytelse.cjs.
// vite preview does not compress, which makes 4G loads several times slower than on the published site.
// usage: node serve-gzip.cjs <dist-folder> <port>
const http = require('http')
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const root = path.resolve(process.argv[2])
const port = Number(process.argv[3] ?? 4175)
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' }

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0])
    let file = path.join(root, url)
    if (!file.startsWith(root)) return res.writeHead(403).end()
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html')
    const body = fs.readFileSync(file)
    const headers = { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' }
    if (/gzip/.test(req.headers['accept-encoding'] ?? '')) {
      const gz = zlib.gzipSync(body)
      res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip', 'Content-Length': gz.length })
      return res.end(gz)
    }
    res.writeHead(200, { ...headers, 'Content-Length': body.length })
    res.end(body)
  })
  .listen(port, () => console.log(`serving ${root} on ${port}`))
