import { load } from "cheerio"
import type { IMahasiswa } from "../types"
import { getHome } from "./home"

export async function extractMahasiswa(): Promise<IMahasiswa> {
    const $ = load(await getHome())
    const profile = $("#kt_app_content_container > div:nth-child(7) > div > div:nth-child(2) > div > div.card.mb-5.mb-xl-10 > div.card-body.pt-9.pb-0 > div > div.flex-grow-1 > div.d-flex.justify-content-between.align-items-start.flex-wrap.mb-2 > div")
    const [nama = "", angkatan = ""] = (profile.find("h1").text()).split("-").map(value => value.trim())
    return {
        nama,
        angkatan,
        prodi: profile.find(".d-flex.flex-wrap.fw-semibold.fs-6.mb-4.pe-2 > a").eq(0).text().trim(),
        periode: profile.find(".d-flex.flex-wrap.fw-semibold.fs-6.mb-4.pe-2 > a").eq(1).text().trim(),
    }
}
