import { load } from "cheerio"
import type { IMatkul } from "../types"
import { cleanText, parseNumber } from "../lib/utils"
import { BASE_URL, getHome, requestHeaders } from "./home"

async function getMatkulPage(): Promise<string> {
    const $ = load(await getHome())
    const path = $("#kt_app_sidebar_menu > div:nth-child(3) > div > div:nth-child(1) > a").attr("href")
    if (!path) throw new Error("Matkul URL not found")
    const response = await fetch(new URL(path, BASE_URL), { headers: requestHeaders() })
    if (!response.ok) throw new Error(`Matkul request failed: ${response.status}`)
    return response.text()
}

export async function extractMatkul(): Promise<IMatkul[]> {
    const $ = load(await getMatkulPage())
    const result: IMatkul[] = []

    $(".tab-pane .card.shadow-sm").each((_, card) => {
        const $card = $(card)
        const ruang = cleanText($card.find(".ribbon-label").first().text())
        const nama = cleanText($card.find(".fs-2.fw-bold").first().clone().children("i").remove().end().text())
        let waktu = "", kelas = "", sks = 0, progress = 0

        $card.find(".border.border-dark.border-dashed .d-flex.align-items-center span").each((_, span) => {
            const text = cleanText($(span).text())
            if (text.startsWith("Jam :")) waktu = cleanText(text.replace("Jam :", ""))
            else if (text.startsWith("Kelas :")) kelas = cleanText(text.replace("Kelas :", ""))
            else if (/^\d+\s*SKS$/i.test(text)) sks = parseInt(text, 10)
        })

        const bar = $card.find('[role="progressbar"]').first().attr("aria-valuenow")
        const progressText = $card.find(".fw-bold.fs-6").filter((_, el) => /%/.test($(el).text())).first().text()
        if (bar?.trim()) progress = parseNumber(bar)
        else if (progressText) progress = parseNumber(progressText)

        const dosen = $card.find(".card-footer .col-md-9 h4").map((_, el) => {
            const clone = $(el).clone()
            clone.find("br").replaceWith("\n")
            return cleanText(clone.text().split("\n")[0])
        }).get().filter(Boolean).join(", ")

        if (nama) result.push({ nama, dosen, waktu, kelas, ruang, sks, progress })
    })

    return result
}
