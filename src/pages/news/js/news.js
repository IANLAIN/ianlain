// News page controller — orchestrates UI state and rendering

import { CATEGORIES, SORTERS } from './config.js';
import { fetchAll } from './fetcher.js';

/* Format date as relative time string */
function timeAgo(date) {
    const seconds = (Date.now() - date.getTime()) / 1000;
    if (seconds < 60)    return 'Just now';
    if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 172800) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

class NewsFeed {
    constructor() {
        this.list     = document.getElementById('newsList');
        this.stats    = document.getElementById('newsStats');
        this.filters  = document.querySelectorAll('.filter-btn');
        this.sortEl   = document.getElementById('sortSelect');
        this.articles = [];
        this.category = 'all';
        this.sort     = 'date-desc';
    }

    async init() {
        this.bindEvents();
        await this.load();
    }

    /* Bind filter buttons and sort select */
    bindEvents() {
        this.filters.forEach(btn => btn.addEventListener('click', () => {
            this.filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.category = btn.dataset.category;
            this.render();
        }));

        this.sortEl?.addEventListener('change', e => {
            this.sort = e.target.value;
            this.render();
        });
    }

    /* Fetch articles and trigger first render */
    async load() {
        try {
            this.articles = await fetchAll();
            this.updateCounts();
            this.render();
        } catch (err) {
            console.error('News fetch failed:', err);
            this.list.innerHTML = '<p class="feed-empty">Failed to load feed. Try again later.</p>';
        }
    }

    /* Update article counts on each filter button via data attribute */
    updateCounts() {
        this.filters.forEach(btn => {
            const cat = btn.dataset.category;
            const count = cat === 'all'
                ? this.articles.length
                : this.articles.filter(a => a.category === cat).length;
            btn.dataset.count = count;
        });
    }

    /* Filter, sort, and render the article list */
    render() {
        const filtered = this.category === 'all'
            ? [...this.articles]
            : this.articles.filter(a => a.category === this.category);

        filtered.sort(SORTERS[this.sort] || SORTERS['date-desc']);

        this.stats.textContent = `${filtered.length} articles`;

        if (!filtered.length) {
            this.list.innerHTML = '<p class="feed-empty">No articles found.</p>';
            return;
        }

        this.list.innerHTML = filtered.map((a, i) => `
            <a class="feed-item" href="${a.url}" target="_blank" rel="noopener noreferrer"
               style="animation-delay: ${Math.min(i * 30, 600)}ms">
                <span class="feed-dot" style="--dot: ${CATEGORIES[a.category]?.color || 'var(--primary)'}"></span>
                <div class="feed-body">
                    <span class="feed-title">${a.title}</span>
                    <span class="feed-meta">${a.source} · ${timeAgo(a.date)}</span>
                </div>
                <span class="feed-arrow">→</span>
            </a>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => new NewsFeed().init());
