import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import schedule from 'node-schedule'
import getAuthPage from '../utils/getAuthPage'
import { LUNCH_URL } from '../constants/baseUrl'

const app = new Hono()

app.get('/', async (c) => {
    const { userId, password } = c.req.query()

    if (!userId || !password)
        throw new HTTPException(401, {
            message: `You don't have UserID or Password!`,
        })

    const { page, browser } = await getAuthPage({ userId, password })

    await page.goto(`${LUNCH_URL}/mobile/listmenu`)

    const menus = await page.$$eval('.menu-title', (elements) => {
        return elements.map((element) => {
            const node = element.parentNode?.children

            if (!node)
                throw new HTTPException(403, { message: `Failed to get menus!` })

            return {
                // @ts-ignore
                title: node[0].innerText,
                // @ts-ignore
                description: node[1].innerText,
                // @ts-ignore
                catering: node[2].innerText,
            }
        })
    })

    browser.close()

    return c.json(menus)
})

app.post('/claim', async (c) => {
    const { userId, password, title, catering } = await c.req.json()

    const scheduleDate = new Date()

    scheduleDate.setHours(8)
    scheduleDate.setMinutes(0)
    scheduleDate.setSeconds(0)
    scheduleDate.setMilliseconds(0)

    const { page, browser } = await getAuthPage({ userId, password })

    schedule.scheduleJob(`${userId}/${c.req.path}`, scheduleDate, async () => {
        await page.goto(`${LUNCH_URL}/mobile/listmenu`)
        // TODO Passing Variable
        await page.$eval('body', element => {
            const definedScript = document.createElement('script')
            definedScript.innerHTML = `
            const userId = "${userId}";
            const password = "${password}";
            const title = "${title}";
            const catering = "${catering}";
            `
            element.appendChild(definedScript)
        })
        await page.evaluate(() => {
            const submits = document.querySelectorAll('.bg-success-mobile')

            let transactionId = null
            // TODO Need to be tested
            submits.forEach(element => {
                // @ts-ignore
                const node = element.parentNode?.parentNode?.parentNode?.parentNode?.children[1].children
                // @ts-ignore
                if (!node?.[0]?.innerText === title && !node?.[2]?.innerText === catering) return

                transactionId = (<HTMLButtonElement>element).value.split('/')[0]
            })

            // @ts-ignore
            $.ajax({
                // @ts-ignore
                url: server + '/Admin/TransactionFoodUser/Create',
                type: 'POST',
                dataType: 'json',
                // @ts-ignore
                data: { TransactionPlanId: transactionId, UserID: userId },
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
                },
                complete: function () {
                    console.info('error')
                }
            });
        })
    })

    browser.close()

    return c.json('Your menu claim schedule has been setted!')
})

export default app
