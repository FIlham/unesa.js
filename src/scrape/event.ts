import { load } from "cheerio"
import { LMS_BASE_URL, requestHeaders } from "./home"

const EVENT_URL = `${LMS_BASE_URL}/lib/ajax/service.php`

export async function getEvent() {
    const page = await fetch(`${LMS_BASE_URL}/my/`, { headers: requestHeaders() })
    if (!page.ok) throw new Error(`Moodle page request failed: ${page.status}`)
    const sesskey = load(await page.text())('input[name="sesskey"]').attr("value")
    if (!sesskey) throw new Error("Moodle sesskey was not found on /my/")
    const now = new Date()
    const url = `${EVENT_URL}?sesskey=${encodeURIComponent(sesskey)}&info=core_calendar_get_calendar_monthly_view`
    const response = await fetch(url, {
        method: "POST",
        headers: { ...requestHeaders(), "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: JSON.stringify([{ index: 0, methodname: "core_calendar_get_calendar_monthly_view", args: {
            year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate(),
            courseid: 1, categoryid: 0, includenavigation: true, mini: true,
        } }]),
    })
    if (!response.ok) throw new Error(`Event request failed: ${response.status}`)
    return response.json()
}
