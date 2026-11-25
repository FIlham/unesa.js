import * as cheerio from 'cheerio';
import { LMS_BASE_URL, requestHeaders } from './home';
import { cleanText } from '../lib/utils';

interface Activity {
    moduleId: number;
    type: string;
    name: string;
    url: string | null;
    iconType: string | null;
    restricted: boolean;
    restrictedReason: string | null;
    completed: boolean | null;
}

interface Section {
    sectionId: number;
    title: string;
    titleAnchor: string;
    descriptionHtml: string;
    descriptionText: string;
    activities: Activity[];
    isEmpty: boolean;
}

/** Ambil tipe dari class "modtype_xxx" */
function getActivityType($li: cheerio.Cheerio<any>): string {
    const cls = $li.attr('class') ?? '';
    const m = cls.match(/modtype_(\w+)/);
    return m?.[1] ?? '';
}

/** Ambil tipe ikon dari src image (pdf-24 → pdf, text-24 → text) */
function getIconType($: cheerio.CheerioAPI, $li: cheerio.Cheerio<any>): string | null {
    const src = $li.find('img.activityicon').attr('src') ?? '';
    // contoh: .../f/pdf-24  atau  .../f/text-24  atau .../assign/icon
    const m = src.match(/\/f\/([a-z0-9]+)-\d+$/i);
    if (m?.[1]) return m[1];
    // fallback: ambil segmen setelah theme/image.php/.../{component}/
    const m2 = src.match(/image\.php\/[^/]+\/([^/]+)\//);
    return m2?.[1] ?? null;
}

/** Parse satu li.activity */
function parseActivity($: cheerio.CheerioAPI, liEl: any): Activity | null {
    const $li = $(liEl);
    const idAttr = $li.attr('id') ?? '';
    const moduleId = parseInt(idAttr.replace('module-', ''), 10);
    if (!moduleId) return null;

    const type = getActivityType($li);
    const $inst = $li.find('.activityinstance').first();
    const name = cleanText($inst.find('.instancename').first().text());

    // Link utama (jika ada, bisa null untuk restricted)
    const $link = $inst.find('a.aalink').first();
    const url = $link.length ? ($link.attr('href') ?? null) : null;

    const iconType = getIconType($, $li);

    // Restricted badge
    const $restricted = $li.find('.availabilityinfo.isrestricted').first();
    const restricted = $restricted.length > 0;
    const restrictedReason = restricted ? cleanText($restricted.text()) : null;

    // Completion: input[name=completionstate] value=0 → completed, 1 → not completed
    let completed: boolean | null = null;
    const $comp = $li.find('input[name="completionstate"]').first();
    if ($comp.length) {
        const val = $comp.attr('value');
        if (val === '0') completed = true;
        else if (val === '1') completed = false;
    }

    return {
        moduleId,
        type,
        name,
        url,
        iconType,
        restricted,
        restrictedReason,
        completed,
    };
}

/** Parse satu li.section */
function parseSection($: cheerio.CheerioAPI, liEl: any): Section | null {
    const $li = $(liEl);
    const sectionId = parseInt($li.attr('data-sectionid') ?? '', 10);
    if (Number.isNaN(sectionId)) return null;

    const $h3 = $li.find('.sectionname').first();
    const $a = $h3.find('a').first();
    const title = cleanText($h3.text());
    const titleAnchor = $a.attr('href') ?? '';

    const $summary = $li.find('.summary .no-overflow').first();
    const descriptionHtml = $summary.length ? ($summary.html() ?? '') : '';
    const descriptionText = $summary.length ? cleanText($summary.text()) : '';

    const activities: Activity[] = [];
    $li.find('ul.section > li.activity').each((_, el) => {
        const act = parseActivity($, el);
        if (act) activities.push(act);
    });

    return {
        sectionId,
        title,
        titleAnchor,
        descriptionHtml,
        descriptionText,
        activities,
        isEmpty: activities.length === 0 && descriptionText === '',
    };
}

/** Parse seluruh halaman course */
function parseCourse(html: string): Section[] {
    const $ = cheerio.load(html);
    const sections: Section[] = [];
    $('ul.topics > li.section').each((_, el) => {
        const s = parseSection($, el);
        if (s) sections.push(s);
    });
    return sections;
}

export async function extractLms(courseId: string): Promise<Section[]> {
    if (!/^\d+$/.test(courseId)) throw new Error("courseId must be numeric")
    const response = await fetch(`${LMS_BASE_URL}/course/view.php?id=${courseId}`, {
        headers: requestHeaders(),
    })
    if (!response.ok) throw new Error(`LMS request failed: ${response.status}`)
    return parseCourse(await response.text())
}
