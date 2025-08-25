async function fetchJSON(url) {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} while fetching ${url}`);
    }
    return response.json();
}

async function fetchText(url) {
    const response = await fetch(url, { cache: 'force-cache' });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} while fetching ${url}`);
    }
    return response.text();
}

//simple in-memory cache so we don’t refetch the same file
const jsonCache = new Map();

async function getCachedJSON(url) {
    if (jsonCache.has(url)) {
        return jsonCache.get(url);
    }
    const data = await fetchJSON(url);
    jsonCache.set(url, data);
    return data;
}

//public api: list directories or fetch a post
export async function list(dirPath) {
    // /blog -> recent posts
    if (dirPath === '/blog') {
        return await getCachedJSON('/blog/index.json');
    }

  //anything outside old_posts we ignore
    if (!dirPath.startsWith('/old_posts')) {
        return null;
    }

    // /old_posts → years (["2025","2024",...])
    if (dirPath === '/old_posts') {
        return await getCachedJSON('/old_posts/index.json');
    }

    // /old_posts/YYYY → months (["01","02",...])
    const yearMatch = dirPath.match(/^\/old_posts\/(\d{4})$/);
    if (yearMatch) {
        const year = yearMatch[1];
        const yearPosts = await getCachedJSON(`/old_posts/${year}/index.json`);
        const months = Array.from(
            new Set(yearPosts.map(p => p.path.split('/')[3]))
        ).sort();
        return months;
    }

    // /old_posts/YYYY/MM → posts (from month index if present, else from year)
    const monthMatch = dirPath.match(/^\/old_posts\/(\d{4})\/(\d{2})$/);
    if (monthMatch) {
        const [_, year, month] = monthMatch;

        //prefer smaller month index
        const monthUrl = `/old_posts/${year}/${month}/index.json`;
        try {
            return await getCachedJSON(monthUrl);
        } catch {
            //fallback: filter from the year index
            const yearPosts = await getCachedJSON(`/old_posts/${year}/index.json`);
            return yearPosts.filter(p =>
                p.path.includes(`/old_posts/${year}/${month}/`)
            );
        }
    }

    return null;
}

export async function fetchPost(sitePath) {
    const normalized = sitePath.startsWith('/') ? sitePath : `/${sitePath}`;
    return await fetchText(normalized);
}