import { Hono } from 'hono'
import schedule from 'node-schedule'
import getAuthPage from '../utils/getAuthPage'
import { LUNCH_URL } from '../constants/baseUrl'

const app = new Hono()

app.post('/claim', async (c) => {
    const { userId, password } = await c.req.json()

    const { page } = await getAuthPage({ userId: userId, password })

    const scheduleDate = new Date()

    scheduleDate.setHours(8)
    scheduleDate.setMinutes(0)
    scheduleDate.setSeconds(0)
    scheduleDate.setMilliseconds(0)

    schedule.scheduleJob(`${userId}/${c.req.path}`, scheduleDate, async () => {
        await page.goto(`${LUNCH_URL}/mobile/Help`)
        const definedScript = document.createElement('script')
        definedScript.innerHTML = `
            const userId = "${userId}";
        `
        await page.$eval('body', (element) => {
            element.appendChild(definedScript)
        })
        await page.evaluate(() => {
            // @ts-ignore
            $.ajax({
                // @ts-ignore
                url: server + '/Admin/TransactionCouponUser/Create',
                type: 'POST',
                dataType: 'json',
                data: { UserID: userId },
                // @ts-ignore
                success: function (result) {
                    if (result.success) {
                        console.info('success')
                    } else {
                        console.info(result.errorMessage)
                    }
                },
                // @ts-ignore
                error: function (xhr, status, error) {
                    console.info(error)
                }
            })
        })
    })


    return c.json('Your coupon claim schedule has been setted!')
})

export default app
