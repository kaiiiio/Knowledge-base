// URL Shortener - Problem Statement

/*
PROBLEM: Design a URL Shortening Service (like bit.ly)

Requirements:
1. Convert long URLs to short URLs
2. Redirect short URLs to original URLs  
3. Track click analytics
4. Support custom aliases
5. Handle millions of requests per day

Constraints:
- Short URLs must be unique
- Redirects must be fast (\u003c100ms)
- System must be highly available
- Analytics should not slow down redirects

Example:
Input: https://www.example.com/very/long/url/path/to/resource?param1=value1&param2=value2
Output: https://short.ly/abc123

Key Challenges:
1. How to generate unique short codes?
2. How to handle high read traffic (redirects)?
3. How to scale to millions of URLs?
4. How to track analytics without impacting performance?
5. How to prevent abuse (spam, malicious URLs)?

Interview Focus Areas:
- Short code generation algorithms
- Caching strategy
- Database design and scaling
- Analytics pipeline
- Rate limiting and security
*/

// Example Usage
const urlShortener = {
    // Create short URL
    create: async (longUrl, customAlias = null) => {
        // POST /api/shorten
        // Returns: { shortUrl: 'https://short.ly/abc123', shortCode: 'abc123' }
    },

    // Redirect
    redirect: async (shortCode) => {
        // GET /:shortCode
        // Returns: 301 Redirect to original URL
    },

    // Get analytics
    getAnalytics: async (shortCode) => {
        // GET /api/analytics/:shortCode
        // Returns: { totalClicks, clicksByDay, topReferrers }
    }
};
