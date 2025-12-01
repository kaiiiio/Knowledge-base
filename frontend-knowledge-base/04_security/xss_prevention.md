# XSS Prevention: Cross-Site Scripting Defense

Cross-Site Scripting (XSS) is a security vulnerability where attackers inject malicious scripts. Understanding XSS prevention is crucial for secure applications.

## What is XSS?

**XSS** allows attackers to inject malicious scripts into web pages viewed by users.

### Types of XSS

1. **Stored XSS**: Malicious script stored in database
2. **Reflected XSS**: Malicious script in URL/input
3. **DOM-based XSS**: Client-side script manipulation

## XSS Prevention

### Sanitize Input

```javascript
// ❌ Dangerous: Direct innerHTML
element.innerHTML = userInput;  // XSS vulnerability!

// ✅ Safe: Sanitize input
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);

// ✅ Better: Use textContent
element.textContent = userInput;
```

### Escape Output

```javascript
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Use
element.innerHTML = escapeHtml(userInput);
```

## React XSS Prevention

```javascript
// React automatically escapes
function UserProfile({ name }) {
    return <div>{name}</div>;  // Automatically escaped
}

// ❌ Dangerous: dangerouslySetInnerHTML
function UserProfile({ html }) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// ✅ Safe: Sanitize first
import DOMPurify from 'dompurify';

function UserProfile({ html }) {
    const cleanHtml = DOMPurify.sanitize(html);
    return <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
}
```

## Vue XSS Prevention

```vue
<!-- Vue automatically escapes -->
<template>
    <div>{{ userInput }}</div>  <!-- Automatically escaped -->
</template>

<!-- ❌ Dangerous: v-html -->
<div v-html="userInput"></div>

<!-- ✅ Safe: Sanitize first -->
<div v-html="sanitizedInput"></div>

<script>
import DOMPurify from 'dompurify';

const sanitizedInput = computed(() => {
    return DOMPurify.sanitize(userInput.value);
});
</script>
```

## Content Security Policy (CSP)

```html
<!-- CSP header prevents XSS -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline';">
```

## Best Practices

1. **Sanitize Input**: Always sanitize user input
2. **Escape Output**: Escape when rendering
3. **Use textContent**: Prefer over innerHTML
4. **CSP**: Implement Content Security Policy
5. **Validate**: Validate input on server

## Summary

**XSS Prevention:**

1. **Sanitize**: Clean user input
2. **Escape**: Escape output
3. **CSP**: Content Security Policy
4. **Frameworks**: Use framework escaping
5. **Validation**: Validate on server

**Key Takeaway:**
XSS allows attackers to inject malicious scripts. Prevent by sanitizing input, escaping output, and using Content Security Policy. React and Vue automatically escape, but be careful with dangerouslySetInnerHTML and v-html. Always validate on server side.

**XSS Strategy:**
- Sanitize input
- Escape output
- Use CSP
- Framework escaping
- Server validation

**Next Steps:**
- Learn [CSRF Prevention](csrf_prevention.md) for attacks
- Study [CORS](cors_configuration.md) for cross-origin
- Master [Security Best Practices](security_best_practices.md) for comprehensive security

