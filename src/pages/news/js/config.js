// News sources configuration and category metadata

export const RSS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';

/* Category display metadata */
export const CATEGORIES = {
    space:    { label: 'Space',    color: '#818cf8' },
    tech:     { label: 'Tech',     color: '#06b6d4' },
    science:  { label: 'Science',  color: '#34d399' },
    security: { label: 'Security', color: '#f472b6' },
};

/* Flat source list — each entry defines its fetch strategy and category */
export const SOURCES = [
    { name: 'Spaceflight News', category: 'space',    type: 'api', url: 'https://api.spaceflightnewsapi.net/v4/articles/?limit=10' },
    { name: 'NASA',             category: 'space',    type: 'rss', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss' },
    { name: 'Hacker News',     category: 'tech',     type: 'rss', url: 'https://news.ycombinator.com/rss' },
    { name: 'FreeCodeCamp',    category: 'tech',     type: 'rss', url: 'https://www.freecodecamp.org/news/rss/' },
    { name: 'ScienceDaily',    category: 'science',  type: 'rss', url: 'https://www.sciencedaily.com/rss/top/science.xml' },
    { name: 'The Hacker News', category: 'security', type: 'rss', url: 'https://feeds.feedburner.com/TheHackersNews' },
    { name: 'Krebs on Security', category: 'security', type: 'rss', url: 'https://krebsonsecurity.com/feed/' },
];

/* Sort comparators keyed by option value */
export const SORTERS = {
    'date-desc':  (a, b) => b.date - a.date,
    'date-asc':   (a, b) => a.date - b.date,
    'source-asc': (a, b) => a.source.localeCompare(b.source),
};
