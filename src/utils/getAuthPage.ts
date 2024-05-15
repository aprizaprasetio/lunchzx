import puppeteer from 'puppeteer'
import { LUNCH_URL } from '../constants/baseUrl';

const getAuthPage = async (user: { userId: string, password: string }) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.setRequestInterception(true);

    page.on('request', request => {
        const allowedResources = ['document', 'xhr', 'fetch', 'script']

        if (allowedResources.includes(request.resourceType()))
            return request.continue()

        request.abort()
    });

    await page.goto(`${LUNCH_URL}/Account/login`)

    await page.type('#UserID', user.userId)
    await page.type('#Password', user.password)

    await page.click('#btnsubmit')

    await page.waitForNavigation()

    return { page, browser }
}

export default getAuthPage
