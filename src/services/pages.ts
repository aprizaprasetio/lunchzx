import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'

const app = new Hono()

app.use('/*', serveStatic({
    root: './pages/',
}))

export default app
