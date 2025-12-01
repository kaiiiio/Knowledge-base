# SPA vs SSR vs SSG: Frontend Architecture Patterns

Understanding Single Page Applications (SPA), Server-Side Rendering (SSR), and Static Site Generation (SSG) helps choose the right architecture.

## Single Page Application (SPA)

**SPA** loads a single HTML page and updates content dynamically via JavaScript.

### How SPA Works

```
Initial Load:
  ┌─────────────┐
  │  index.html │ ← Single HTML file
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  JavaScript │ ← Handles routing, rendering
  └─────────────┘

Navigation:
  ┌─────────────┐
  │  /about     │ ← JavaScript updates DOM
  └─────────────┘
```

### SPA Example

```javascript
// React Router (SPA)
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </BrowserRouter>
    );
}

// Navigation updates DOM, no page reload
```

### SPA Pros and Cons

**Pros:**
- Fast navigation (no page reload)
- Rich interactivity
- Better UX
- Client-side routing

**Cons:**
- Slower initial load
- SEO challenges
- Requires JavaScript
- More complex state management

## Server-Side Rendering (SSR)

**SSR** renders HTML on the server for each request.

### How SSR Works

```
Request:
  ┌─────────────┐
  │  GET /about │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │   Server    │ ← Renders HTML
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  HTML Page  │ ← Fully rendered
  └─────────────┘
```

### SSR Example

```javascript
// Next.js (SSR)
export async function getServerSideProps(context) {
    const data = await fetchData();
    return {
        props: { data }
    };
}

function About({ data }) {
    return <div>{data.title}</div>;
}

// Server renders HTML for each request
```

### SSR Pros and Cons

**Pros:**
- SEO friendly
- Fast initial load
- Works without JavaScript
- Better for content sites

**Cons:**
- Slower server response
- Higher server load
- More complex setup
- Requires server for each request

## Static Site Generation (SSG)

**SSG** pre-renders HTML at build time.

### How SSG Works

```
Build Time:
  ┌─────────────┐
  │  Build      │ ← Generate HTML files
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  /index.html│
  │  /about.html│
  │  /contact.html│
  └─────────────┘

Request:
  ┌─────────────┐
  │  GET /about │
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  /about.html│ ← Pre-rendered
  └─────────────┘
```

### SSG Example

```javascript
// Next.js (SSG)
export async function getStaticProps() {
    const data = await fetchData();
    return {
        props: { data }
    };
}

function About({ data }) {
    return <div>{data.title}</div>;
}

// HTML generated at build time
```

### SSG Pros and Cons

**Pros:**
- Fastest load time
- SEO friendly
- Works without server
- CDN friendly
- Secure (no server)

**Cons:**
- No dynamic content
- Rebuild required for changes
- Limited interactivity
- Build time increases

## When to Use Each

### Use SPA When:
- Rich interactivity needed
- Dashboard/application
- Real-time updates
- Complex state management

### Use SSR When:
- SEO critical
- Content-heavy sites
- Dynamic content per request
- Social media sharing

### Use SSG When:
- Static content
- Blog/documentation
- Marketing sites
- Maximum performance needed

## Hybrid Approaches

### Incremental Static Regeneration (ISR)

```javascript
// Next.js ISR
export async function getStaticProps() {
    const data = await fetchData();
    return {
        props: { data },
        revalidate: 60  // Regenerate every 60 seconds
    };
}
```

## Best Practices

1. **Choose Right Pattern**: Based on requirements
2. **Hybrid**: Use ISR for dynamic static content
3. **Performance**: Optimize for chosen pattern
4. **SEO**: Consider SSR/SSG for SEO
5. **Complexity**: Balance complexity vs benefits

## Summary

**SPA vs SSR vs SSG:**

1. **SPA**: Client-side rendering, fast navigation
2. **SSR**: Server renders per request, SEO friendly
3. **SSG**: Pre-rendered at build, fastest load
4. **Choose**: Based on requirements
5. **Hybrid**: ISR for best of both

**Key Takeaway:**
SPA provides rich interactivity but slower initial load. SSR provides SEO and fast initial load but requires server. SSG provides fastest load and SEO but no dynamic content. Choose based on requirements. Use hybrid approaches (ISR) for dynamic static content.

**Architecture Strategy:**
- SPA for applications
- SSR for content sites
- SSG for static sites
- Hybrid for flexibility
- Optimize accordingly

**Next Steps:**
- Learn [State Management](state_management_patterns.md) for SPA
- Study [Routing](client_side_routing.md) for navigation
- Master [Performance](../07_performance/) for optimization

