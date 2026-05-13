const http = require('node:http')
const { URL } = require('node:url')

const PORT = 8082

const pages = [
    {
        id: 1,
        pageId: '1',
        emoji: '📝',
        title: '欢迎使用妙码协同文档',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 2,
        pageId: '2',
        emoji: '🚀',
        title: '快速开始指南',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
]

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, token')

    if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
    }

    const url = new URL(req.url, `http://localhost:${PORT}`)
    const path = url.pathname

    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', () => {
        const data = body ? JSON.parse(body) : {}

        // 注册
        if (req.method === 'POST' && path === '/api/user/register') {
            res.end(JSON.stringify({ data: { id: Date.now().toString(), username: data.username }, success: true }))
            return
        }

        // 登录
        if (req.method === 'POST' && path === '/api/auth/login') {
            res.end(JSON.stringify({ data: { access_token: 'mock-token-' + Date.now() }, success: true }))
            return
        }

        // 当前用户
        if (req.method === 'GET' && path === '/api/currentUser') {
            res.end(JSON.stringify({ data: { userId: 1, username: 'test', email: 'test@miaoma.com' } }))
            return
        }

        // 页面列表
        if (req.method === 'GET' && path === '/api/page') {
            res.end(JSON.stringify({ data: { pages, count: pages.length }, success: true }))
            return
        }

        // 页面详情
        const detailMatch = path.match(/^\/api\/page\/(.+)$/)
        if (req.method === 'GET' && detailMatch) {
            const page = pages.find(p => p.pageId === detailMatch[1])
            res.end(JSON.stringify({ data: page || pages[0], success: true }))
            return
        }

        // 创建页面
        if (req.method === 'POST' && path === '/api/page') {
            const id = pages.length + 1
            const newPage = {
                id,
                pageId: id.toString(),
                emoji: data.emoji || '📄',
                title: data.title || '未命名文档',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            pages.push(newPage)
            res.end(JSON.stringify({ data: newPage, success: true }))
            return
        }

        // 更新页面
        if (req.method === 'PUT' && path === '/api/page') {
            const page = pages.find(p => p.pageId === data.pageId)
            if (page) {
                Object.assign(page, data, { updatedAt: new Date().toISOString() })
            }
            res.end(JSON.stringify({ data: page, success: true }))
            return
        }

        // 删除页面
        if (req.method === 'DELETE' && path === '/api/page') {
            const idx = pages.findIndex(p => p.pageId === data.pageId)
            if (idx !== -1) pages.splice(idx, 1)
            res.end(JSON.stringify({ success: true }))
            return
        }

        // 页面图谱
        if (req.method === 'GET' && path === '/api/page/graph') {
            res.end(JSON.stringify({ data: pages, success: true }))
            return
        }

        res.writeHead(404)
        res.end(JSON.stringify({ message: 'Not Found' }))
    })
})

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Mock server running at http://localhost:${PORT}`)
})
