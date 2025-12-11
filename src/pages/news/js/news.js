// News Aggregator using Open APIs and RSS

const PROXY_URL = 'https://api.rss2json.com/v1/api.json?rss_url=';

// Open Sources
const SOURCES = {
    space: [
        {
            name: 'Spaceflight News',
            type: 'api',
            url: 'https://api.spaceflightnewsapi.net/v4/articles/?limit=10'
        },
        {
            name: 'NASA',
            type: 'rss',
            url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss'
        }
    ],
    tech: [
        {
            name: 'Hacker News',
            type: 'rss',
            url: 'https://news.ycombinator.com/rss'
        },
        {
            name: 'FreeCodeCamp',
            type: 'rss',
            url: 'https://www.freecodecamp.org/news/rss/'
        }
    ],
    science: [
        {
            name: 'ScienceDaily',
            type: 'rss',
            url: 'https://www.sciencedaily.com/rss/top/science.xml'
        }
    ],
    security: [
        {
            name: 'The Hacker News',
            type: 'rss',
            url: 'https://feeds.feedburner.com/TheHackersNews'
        },
        {
            name: 'Krebs on Security',
            type: 'rss',
            url: 'https://krebsonsecurity.com/feed/'
        }
    ]
};

class NewsFeed {
    constructor() {
        this.grid = document.getElementById('newsGrid');
        this.filters = document.querySelectorAll('.filter-btn');
        this.sortSelect = document.getElementById('sortSelect');
        this.articles = [];
        this.currentCategory = 'all';
        this.currentSort = 'date-desc';
        
        this.init();
    }

    init() {
        this.setupFilters();
        this.setupSort();
        this.fetchAllNews();
    }

    setupFilters() {
        this.filters.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update UI
                this.filters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter Content
                this.currentCategory = btn.dataset.category;
                this.render();
            });
        });
    }

    setupSort() {
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.render();
            });
        }
    }

    async fetchAllNews() {
        try {
            const promises = [];
            
            // Collect all fetch promises
            Object.entries(SOURCES).forEach(([category, sources]) => {
                sources.forEach(source => {
                    if (source.type === 'api') {
                        promises.push(this.fetchSpaceflightNews(category));
                    } else {
                        promises.push(this.fetchRSS(source.url, source.name, category));
                    }
                });
            });

            const results = await Promise.allSettled(promises);
            
            // Flatten and sort results
            this.articles = results
                .filter(r => r.status === 'fulfilled')
                .flatMap(r => r.value)
                .map(article => ({
                    ...article,
                    readTime: Math.ceil(article.summary.length / 1000) // Rough estimate: 1 min per 1000 chars
                }));

            this.render();
        } catch (error) {
            console.error('Error fetching news:', error);
            this.grid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load news feed. Please try again later.</p>
                </div>
            `;
        }
    }

    async fetchSpaceflightNews(category) {
        const response = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=10');
        const data = await response.json();
        
        return data.results.map(article => ({
            title: article.title,
            url: article.url,
            image: article.image_url,
            summary: article.summary,
            date: article.published_at,
            source: 'Spaceflight News',
            category: category
        }));
    }

    async fetchRSS(url, sourceName, category) {
        const response = await fetch(`${PROXY_URL}${encodeURIComponent(url)}`);
        const data = await response.json();
        
        if (data.status !== 'ok') return [];

        return data.items.map(item => ({
            title: item.title,
            url: item.link,
            image: item.thumbnail || this.getFallbackImage(category),
            summary: this.stripHtml(item.description),
            date: item.pubDate,
            source: sourceName,
            category: category
        }));
    }

    render() {
        this.grid.innerHTML = '';
        
        let filtered = this.currentCategory === 'all' 
            ? this.articles 
            : this.articles.filter(a => a.category === this.currentCategory);

        // Sort
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'read-asc':
                    return a.readTime - b.readTime;
                case 'read-desc':
                    return b.readTime - a.readTime;
                case 'date-desc':
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        if (filtered.length === 0) {
            this.grid.innerHTML = '<p class="no-results">No articles found.</p>';
            return;
        }

        filtered.forEach((article, index) => {
            const card = document.createElement('article');
            card.className = 'news-card';
            card.style.animationDelay = `${index * 0.1}s`;
            
            const date = new Date(article.date).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            card.innerHTML = `
                <img src="${article.image || this.getFallbackImage(article.category)}" 
                     alt="${article.title}" class="news-image" loading="lazy"
                     onerror="this.src='${this.getFallbackImage(article.category)}'">
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-source">${article.source}</span>
                        <span class="news-date">${date}</span>
                        <span class="news-read-time"><i class="far fa-clock"></i> ${article.readTime} min</span>
                    </div>
                    <h3 class="news-heading">${article.title}</h3>
                    <p class="news-excerpt">${article.summary.substring(0, 120)}...</p>
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="news-link">
                        Read Article <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `;
            
            this.grid.appendChild(card);
        });
    }

    stripHtml(html) {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    getFallbackImage(category) {
        const images = {
            space: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80',
            tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80',
            science: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=500&q=80',
            security: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500&q=80'
        };
        return images[category] || images.tech;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new NewsFeed();
});
