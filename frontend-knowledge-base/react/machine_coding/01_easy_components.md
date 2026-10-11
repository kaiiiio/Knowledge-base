# Easy React Components: Counter, Accordion, Contact Form

Complete solutions for easy-level React machine coding questions with explanations and visualizations.

## 1. Counter Component

### Question
Build a simple counter that increments whenever a button is clicked.

### Solution

```jsx
import React, { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);

    const handleIncrement = () => {
        setCount(count + 1);
    };

    return (
        <div className="counter">
            <h2>Counter: {count}</h2>
            <button onClick={handleIncrement}>
                Increment
            </button>
        </div>
    );
}

export default Counter;
```

### Explanation
- **useState Hook**: Manages counter state, initialized to 0
- **handleIncrement**: Updates count by adding 1
- **onClick Handler**: Triggers increment on button click
- **State Update**: `setCount` triggers re-render with new value

### Visualization
```
Initial State: Counter: 0
After 1 click: Counter: 1
After 2 clicks: Counter: 2
```

---

## 2. Accordion Component

### Question
Build an accordion component that displays a list of vertically stacked sections with each containing a title and content snippet. Only one section can be open at a time.

### Solution

```jsx
import React, { useState } from 'react';

function Accordion({ items }) {
    const [openIndex, setOpenIndex] = useState(null);

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="accordion">
            {items.map((item, index) => (
                <div key={index} className="accordion-item">
                    <button
                        className="accordion-header"
                        onClick={() => handleToggle(index)}
                        aria-expanded={openIndex === index}
                    >
                        <span>{item.title}</span>
                        <span>{openIndex === index ? '−' : '+'}</span>
                    </button>
                    {openIndex === index && (
                        <div className="accordion-content">
                            {item.content}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// Usage
const accordionItems = [
    { title: 'Section 1', content: 'Content for section 1' },
    { title: 'Section 2', content: 'Content for section 2' },
    { title: 'Section 3', content: 'Content for section 3' }
];

function App() {
    return <Accordion items={accordionItems} />;
}
```

### Explanation
- **State Management**: `openIndex` tracks which section is open (null = all closed)
- **Toggle Logic**: Clicking opens section if closed, closes if open
- **Conditional Rendering**: Content only shows when `openIndex === index`
- **Accessibility**: `aria-expanded` for screen readers

### Visualization
```
[Section 1 +]  ← Closed
[Section 2 +]  ← Closed
[Section 3 +]  ← Closed

After clicking Section 1:
[Section 1 −]  ← Open
  Content for section 1
[Section 2 +]  ← Closed
[Section 3 +]  ← Closed
```

---

## 3. Contact Form

### Question
Build a contact form which submits user feedback and contact details to a back end API.

### Solution

```jsx
import React, { useState } from 'react';

function ContactForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }
        
        setIsSubmitting(true);
        setSubmitStatus(null);
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('Submission failed');
            }
            
            setSubmitStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className={errors.message ? 'error' : ''}
                />
                {errors.message && <span className="error-message">{errors.message}</span>}
            </div>
            
            {submitStatus === 'success' && (
                <div className="success-message">
                    Thank you! Your message has been sent.
                </div>
            )}
            
            {submitStatus === 'error' && (
                <div className="error-message">
                    Something went wrong. Please try again.
                </div>
            )}
            
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
}

export default ContactForm;
```

### Explanation
- **Form State**: Manages name, email, message fields
- **Validation**: Client-side validation before submission
- **Error Handling**: Shows field-specific errors
- **API Integration**: Submits to backend with proper error handling
- **Loading State**: Disables button during submission
- **Success/Error Feedback**: Shows status messages

### Visualization
```
┌─────────────────────────┐
│ Contact Form            │
├─────────────────────────┤
│ Name: [____________]    │
│ Email: [____________]   │
│ Message: [__________]   │
│         [__________]    │
│ [Submit]               │
└─────────────────────────┘

After validation error:
┌─────────────────────────┐
│ Name: [____________]    │
│ ⚠ Name is required     │
│ Email: [____________]   │
│ Message: [__________]   │
│ ⚠ Message is required  │
└─────────────────────────┘
```

---

## 4. Holy Grail Layout

### Question
Build the famous holy grail layout consisting of a header, 3 columns, and a footer.

### Solution

```jsx
import React from 'react';

function HolyGrailLayout() {
    return (
        <div className="holy-grail">
            <header className="header">
                <h1>Header</h1>
            </header>
            
            <div className="container">
                <aside className="sidebar sidebar-left">
                    <h2>Left Sidebar</h2>
                    <nav>
                        <ul>
                            <li>Link 1</li>
                            <li>Link 2</li>
                            <li>Link 3</li>
                        </ul>
                    </nav>
                </aside>
                
                <main className="main-content">
                    <h2>Main Content</h2>
                    <p>This is the main content area.</p>
                </main>
                
                <aside className="sidebar sidebar-right">
                    <h2>Right Sidebar</h2>
                    <div>Advertisements or additional content</div>
                </aside>
            </div>
            
            <footer className="footer">
                <p>Footer</p>
            </footer>
        </div>
    );
}

export default HolyGrailLayout;
```

### CSS (Flexbox Approach)

```css
.holy-grail {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.header,
.footer {
    background: #333;
    color: white;
    padding: 1rem;
    text-align: center;
}

.container {
    display: flex;
    flex: 1;
}

.sidebar-left,
.sidebar-right {
    width: 200px;
    background: #f0f0f0;
    padding: 1rem;
}

.main-content {
    flex: 1;
    padding: 1rem;
    background: white;
}

@media (max-width: 768px) {
    .container {
        flex-direction: column;
    }
    
    .sidebar-left,
    .sidebar-right {
        width: 100%;
    }
}
```

### Explanation
- **Flexbox Layout**: Uses flex for responsive layout
- **Three Columns**: Left sidebar, main content, right sidebar
- **Responsive**: Stacks on mobile devices
- **Semantic HTML**: Uses header, main, aside, footer

### Visualization
```
┌─────────────────────────────────┐
│         Header                  │
├──────┬──────────────┬───────────┤
│ Left │              │ Right     │
│ Side │ Main Content │ Sidebar   │
│ bar  │              │           │
│      │              │           │
├──────┴──────────────┴───────────┤
│         Footer                  │
└─────────────────────────────────┘
```

---

## 5. Progress Bars

### Question
Build a list of progress bars that fill up gradually when they are added to the page.

### Solution

```jsx
import React, { useState, useEffect } from 'react';

function ProgressBar({ target, label, delay = 0 }) {
    const [progress, setProgress] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsAnimating(true);
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= target) {
                        clearInterval(interval);
                        return target;
                    }
                    return prev + 1;
                });
            }, 20); // Update every 20ms for smooth animation

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(timer);
    }, [target, delay]);

    return (
        <div className="progress-bar-container">
            <div className="progress-bar-label">
                <span>{label}</span>
                <span>{progress}%</span>
            </div>
            <div className="progress-bar-track">
                <div
                    className="progress-bar-fill"
                    style={{
                        width: `${progress}%`,
                        transition: isAnimating ? 'width 0.1s ease' : 'none'
                    }}
                />
            </div>
        </div>
    );
}

function ProgressBarsList() {
    const [bars, setBars] = useState([]);
    const [nextId, setNextId] = useState(1);

    const addProgressBar = () => {
        const newBar = {
            id: nextId,
            label: `Task ${nextId}`,
            target: Math.floor(Math.random() * 100) + 1,
            delay: bars.length * 500 // Stagger animation
        };
        setBars(prev => [...prev, newBar]);
        setNextId(prev => prev + 1);
    };

    return (
        <div className="progress-bars-list">
            <button onClick={addProgressBar} className="add-button">
                Add Progress Bar
            </button>
            <div className="bars-container">
                {bars.map(bar => (
                    <ProgressBar
                        key={bar.id}
                        target={bar.target}
                        label={bar.label}
                        delay={bar.delay}
                    />
                ))}
            </div>
        </div>
    );
}

export default ProgressBarsList;
```

### CSS

```css
.progress-bars-list {
    padding: 2rem;
}

.add-button {
    margin-bottom: 2rem;
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.progress-bar-container {
    margin-bottom: 1.5rem;
}

.progress-bar-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.progress-bar-track {
    width: 100%;
    height: 24px;
    background: #e0e0e0;
    border-radius: 12px;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #4caf50, #8bc34a);
    border-radius: 12px;
    transition: width 0.1s ease;
}
```

### Explanation
- **State Management**: Tracks progress percentage for each bar
- **Animation**: Gradually fills from 0% to target percentage
- **Staggered Animation**: Each new bar starts after a delay
- **Smooth Updates**: Uses setInterval for smooth animation
- **Dynamic Addition**: New bars can be added dynamically

### Visualization
```
[Add Progress Bar]

Task 1: 75% [████████████████░░░░] 75%
Task 2: 45% [█████████░░░░░░░░░░░] 45%
Task 3: 90% [██████████████████░░] 90%
```

---

## Key Patterns Used

1. **useState**: For component state management
2. **useEffect**: For side effects and animations
3. **Event Handlers**: onClick, onChange for user interactions
4. **Conditional Rendering**: Show/hide based on state
5. **Form Handling**: Controlled inputs with validation
6. **API Integration**: Async operations with error handling
7. **CSS Styling**: Modern flexbox/grid layouts

## Best Practices

- ✅ Use controlled components for forms
- ✅ Validate input before submission
- ✅ Show loading states during async operations
- ✅ Provide user feedback (success/error messages)
- ✅ Make components accessible (ARIA attributes)
- ✅ Use semantic HTML elements
- ✅ Handle edge cases and errors gracefully


---

## Special JSX Attributes Explained (aria-*, htmlFor, etc.)  ---- IMP

Ye attributes machine-coding rounds me use hote hain aur interviewer aksar puchta hai "ye kyun likha?". Har ek ki 1-line speakable definition:

### Used in this file

| Attribute | What it does | Why we use it |
|---|---|---|
| `aria-expanded={openIndex === index}` | Screen reader ko batata hai ki ye button jis panel ko control karta hai wo **abhi open hai ya closed** (`true`/`false`) | Accordion/dropdown me blind user ko bina dekhe pata chalta hai section khula ya band. Interview line: *"State visually dikhta hai, but screen reader ko explicitly batana padta hai — aria-expanded exactly wahi karta hai."* |
| `htmlFor="name"` | HTML ke `for` attribute ka JSX version — label ko us `id` wale input se **link** karta hai | (1) Label pe click → input focus hota hai; (2) screen reader input ka naam bol pata hai. JSX me `for` nahi likh sakte kyunki wo JS ka reserved keyword hai (`for` loop) — isliye `htmlFor`. Same reason: `class` → `className`. |

### The full aria-* family (interviews me common)

| Attribute | Meaning | Typical use |
|---|---|---|
| `aria-label="Close"` | Element ka **accessible naam** jab visible text nahi hai | Icon-only buttons (❌, 🔍) — warna screen reader bas "button" bolega |
| `aria-labelledby="id"` | Naam kisi **dusre element ke text** se lo | Modal ka title heading modal ko label kare |
| `aria-describedby="id"` | Extra **description** link karo | Input ke neeche error message / hint jodna |
| `aria-hidden="true"` | Element ko screen reader se **chhupao** (visually dikhta rahega) | Decorative icons/emojis jo sirf sajawat hain |
| `aria-controls="panel-id"` | Batata hai ye button **kis element ko control** karta hai | Accordion button → uska panel; tab → uska tabpanel |
| `aria-live="polite"` | Is region me **content change hone pe screen reader announce kare** | Toast notifications, search results count, form errors |
| `aria-current="page"` | List me se **ye wala abhi active** hai | Navbar ka current page link, pagination ka current number |
| `aria-disabled="true"` | Screen reader ko disabled batao (par focusable rahta hai) | Jab `disabled` attribute se focus bhi hat jata hai aur tum tooltip dikhana chahte ho |
| `aria-selected` / `aria-checked` | Tab/option **selected** hai / checkbox **checked** hai | Custom tabs, custom checkboxes (jo native input nahi hain) |
| `role="dialog"` / `role="tablist"` etc. | Non-semantic element (div) ko **semantic meaning** do | Custom modal, tabs, menu — jab native element use nahi kiya |
| `tabIndex={0}` / `tabIndex={-1}` | `0` = element **Tab key se focusable** banao; `-1` = programmatically focusable (Tab se nahi) | Custom clickable divs; modal open pe focus bhejne ke liye -1 |

### The JSX-vs-HTML rename family

| HTML | JSX | Kyun rename hua |
|---|---|---|
| `class` | `className` | `class` JS ka reserved keyword hai |
| `for` | `htmlFor` | `for` JS ka loop keyword hai |
| `onclick` | `onClick` | JSX camelCase events use karta hai (synthetic events) |
| `style="color:red"` | `style={{ color: 'red' }}` | JSX me style ek **object** hai, string nahi |

### 20-second oral answer (agar puchhe "accessibility kaise handle karte ho?")

> "Semantic HTML pehle — button ke liye `<button>`, form me `<label htmlFor>`. Jahan custom widgets banane pade — accordion, tabs, modal — wahan ARIA se state aur relationships batata hoon: `aria-expanded` open/close state ke liye, `aria-controls` kis panel ko control karta hai, `aria-label` icon-only buttons ke liye, aur keyboard support (`tabIndex`, Enter/Space handlers). Rule of thumb: ARIA tab lagao jab native element kaafi na ho — first rule of ARIA is don't use ARIA."
