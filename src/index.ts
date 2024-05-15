import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { swaggerUI } from '@hono/swagger-ui'
import pages from './services/pages'
import menus from './services/menus'
import coupon from './services/coupon'

const app = new Hono()

app.route('/', pages)
app.route('/menus', menus)
app.route('/coupon', coupon)

app.get('/ui', swaggerUI({ url: '/doc' }))

app.request

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
