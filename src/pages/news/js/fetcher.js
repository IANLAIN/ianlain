// Unified news data fetching and normalization

import { RSS_PROXY, SOURCES } from './config.js';

/* Strip HTML tags from a string */
function stripHtml(html) {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el.textContent || '';
}

/* Build a normalized article object from raw data */
function normalize(raw, source) {
    return {
        title: raw.title?.trim() || 'Untitled',
        url: raw.url,
        date: new Date(raw.date),
        source: source.name,
        category: source.category,
    };
}

/* Fetch strategies by source type — each returns a normalized article array */
const STRATEGIES = {
    async api(source) {
        const res = await fetch(source.url);
        const { results } = await res.json();
        return results.map(a => normalize(
            { title: a.title, url: a.url, date: a.published_at }, source
        ));
    },

    async rss(source) {
        const res = await fetch(`${RSS_PROXY}${encodeURIComponent(source.url)}`);
        const data = await res.json();
        if (data.status !== 'ok') return [];
        return data.items.map(item => normalize(
            { title: stripHtml(item.title), url: item.link, date: item.pubDate }, source
        ));
    },
};

/* Fetch all sources concurrently, return flat deduplicated array */
export async function fetchAll() {
    const results = await Promise.allSettled(
        SOURCES.map(src => STRATEGIES[src.type](src))
    );

    const articles = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

    /* Deduplicate by URL */
    const seen = new Set();
    return articles.filter(a => {
        if (seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
    });
}
