# Frontend Performance Optimization: Core Web Vitals

Frontend performance optimization improves user experience and SEO. This guide covers Core Web Vitals and optimization techniques.

## Core Web Vitals

### Largest Contentful Paint (LCP)

**LCP** measures loading performance (should be < 2.5s).

```javascript
// Optimize LCP:
// - Optimize images
// - Preload critical resources
// - Reduce server response time
// - Eliminate render-blocking resources

// Preload critical resources
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="hero-image.jpg" as="image">
```

### First Input Delay (FID)

**FID** measures interactivity (should be < 100ms).

```javascript
// Optimize FID:
// - Reduce JavaScript execution time
// - Code splitting
// - Lazy load non-critical JS
// - Use Web Workers for heavy tasks

// Code splitting
const LazyComponent = lazy(() => import('./LazyComponent'));
```

### Cumulative Layout Shift (CLS)

**CLS** measures visual stability (should be < 0.1).

```javascript
// Optimize CLS:
// - Set image dimensions
// - Reserve space for ads
// - Avoid inserting content above existing
// - Use transform for animations

// Set image dimensions
<img src="image.jpg" width="800" height="600" alt="Image">
```

## Performance Optimization Techniques

### Code Splitting

```javascript
// React: Lazy loading
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LazyComponent />
        </Suspense>
    );
}
```

### Image Optimization

```javascript
// Lazy load images
<img 
    src="image.jpg" 
    loading="lazy" 
    alt="Image"
/>

// Responsive images
<img 
    srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
    sizes="(max-width: 600px) 480px, 800px"
    src="medium.jpg"
    alt="Responsive image"
/>
```

### Bundle Optimization

```javascript
// Tree shaking: Remove unused code
// Minification: Compress code
// Compression: Gzip/Brotli
// Caching: Browser caching
```

## Best Practices

1. **Optimize Images**: Compress, lazy load, use modern formats
2. **Code Splitting**: Split code into chunks
3. **Minify**: Minify CSS and JavaScript
4. **Cache**: Use browser caching
5. **Monitor**: Track Core Web Vitals

## Summary

**Frontend Performance Optimization:**

1. **Core Web Vitals**: LCP, FID, CLS
2. **Techniques**: Code splitting, image optimization
3. **Best Practice**: Optimize images, split code, minify
4. **Metrics**: Monitor Core Web Vitals
5. **Benefits**: Better UX, SEO, conversions

**Key Takeaway:**
Frontend performance optimization improves user experience. Focus on Core Web Vitals (LCP, FID, CLS). Optimize images, split code, minify assets. Use lazy loading and code splitting. Monitor performance metrics. Better performance improves SEO and conversions.

**Performance Strategy:**
- Optimize Core Web Vitals
- Code splitting
- Image optimization
- Minify assets
- Monitor metrics

**Next Steps:**
- Learn [Lighthouse](lighthouse_scoring.md) for auditing
- Study [Bundle Optimization](bundle_optimization.md) for size
- Master [Caching Strategies](../03_networking/caching_strategies.md) for performance

