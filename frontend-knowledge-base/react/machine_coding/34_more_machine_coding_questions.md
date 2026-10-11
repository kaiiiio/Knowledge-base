# More Machine Coding Questions: Complete Solutions

Solutions for additional commonly-asked React machine coding interview questions, in the style of [GreatFrontEnd.com](https://www.greatfrontend.com/questions/formats/ui-coding).

## 1. Command Palette (Cmd+K Typeahead)

### Question
Build a command palette (like VS Code / Linear) that opens with `Cmd+K` / `Ctrl+K`, lets users fuzzy-search a list of commands with the keyboard, navigate results with arrow keys, and execute the highlighted command with `Enter`. Pressing `Escape` or clicking outside should close it.

### Solution

```jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';

const COMMANDS = [
    { id: 1, label: 'Open Settings', group: 'General', action: () => alert('Opening Settings') },
    { id: 2, label: 'Create New File', group: 'File', action: () => alert('New File') },
    { id: 3, label: 'Create New Folder', group: 'File', action: () => alert('New Folder') },
    { id: 4, label: 'Toggle Dark Mode', group: 'View', action: () => alert('Theme toggled') },
    { id: 5, label: 'Search Documentation', group: 'Help', action: () => alert('Opening Docs') },
    { id: 6, label: 'Sign Out', group: 'Account', action: () => alert('Signed out') },
];

function fuzzyMatch(query, text) {
    query = query.toLowerCase();
    text = text.toLowerCase();
    let qi = 0;
    for (let ti = 0; ti < text.length && qi < query.length; ti++) {
        if (text[ti] === query[qi]) qi++;
    }
    return qi === query.length;
}

function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const results = query
        ? COMMANDS.filter((cmd) => fuzzyMatch(query, cmd.label))
        : COMMANDS;

    const close = useCallback(() => {
        setIsOpen(false);
        setQuery('');
        setActiveIndex(0);
    }, []);

    // Global shortcut to open palette
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    useEffect(() => {
        const activeEl = listRef.current?.children[activeIndex];
        activeEl?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            close();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const cmd = results[activeIndex];
            if (cmd) {
                cmd.action();
                close();
            }
        }
    };

    if (!isOpen) {
        return (
            <button className="open-palette-btn" onClick={() => setIsOpen(true)}>
                Press <kbd>Ctrl</kbd> + <kbd>K</kbd> to open
            </button>
        );
    }

    return (
        <div className="palette-overlay" onMouseDown={close}>
            <div className="palette" onMouseDown={(e) => e.stopPropagation()}>
                <input
                    ref={inputRef}
                    className="palette-input"
                    placeholder="Type a command..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <ul className="palette-list" ref={listRef} role="listbox">
                    {results.length === 0 && <li className="palette-empty">No results</li>}
                    {results.map((cmd, index) => (
                        <li
                            key={cmd.id}
                            role="option"
                            aria-selected={index === activeIndex}
                            className={`palette-item ${index === activeIndex ? 'active' : ''}`}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => {
                                cmd.action();
                                close();
                            }}
                        >
                            <span className="palette-item-label">{cmd.label}</span>
                            <span className="palette-item-group">{cmd.group}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default CommandPalette;
```

### CSS

```css
.palette-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 10vh;
    z-index: 1000;
}

.palette {
    width: 560px;
    max-width: 90vw;
    background: white;
    border-radius: 10px;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
    overflow: hidden;
}

.palette-input {
    width: 100%;
    border: none;
    border-bottom: 1px solid #e5e7eb;
    padding: 16px;
    font-size: 16px;
    outline: none;
    box-sizing: border-box;
}

.palette-list {
    list-style: none;
    margin: 0;
    padding: 8px;
    max-height: 320px;
    overflow-y: auto;
}

.palette-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
}

.palette-item.active,
.palette-item:hover {
    background: #eef2ff;
}

.palette-item-group {
    color: #6b7280;
    font-size: 12px;
}

.palette-empty {
    padding: 16px;
    text-align: center;
    color: #6b7280;
}
```

### Explanation
1. A global `keydown` listener on `window` watches for `Cmd/Ctrl+K` to open the palette regardless of focus.
2. `fuzzyMatch` does a simple subsequence match (characters of the query must appear in order in the target string) — enough for typeahead without a library.
3. `activeIndex` tracks keyboard-highlighted result; `ArrowUp`/`ArrowDown` clamp it within bounds, and it resets to `0` whenever the query changes.
4. `scrollIntoView({ block: 'nearest' })` keeps the highlighted item visible as the list scrolls.
5. `Enter` executes the highlighted command's `action` and closes the palette; `Escape` or an overlay click also closes it.
6. The input auto-focuses via `useEffect` whenever `isOpen` flips to `true`.

### Usage Example

```jsx
<CommandPalette />
```

### Best Practices
- Trap focus within the palette while open for accessibility.
- Debounce fuzzy matching only if the command list is very large; otherwise it's cheap enough to run on every keystroke.
- Use `role="listbox"` / `role="option"` and `aria-selected` so screen readers announce the active item.
- Clean up the global keydown listener on unmount to avoid leaks.

---

## 2. Rich Text Editor (contentEditable Basics)

### Question
Build a minimal rich text editor with a toolbar (Bold, Italic, Underline, bullet list) using a `contentEditable` div, and a live HTML preview of the content.

### Solution

```jsx
import React, { useRef, useState, useCallback } from 'react';

const TOOLBAR_ACTIONS = [
    { command: 'bold', label: 'B', style: { fontWeight: 'bold' } },
    { command: 'italic', label: 'I', style: { fontStyle: 'italic' } },
    { command: 'underline', label: 'U', style: { textDecoration: 'underline' } },
    { command: 'insertUnorderedList', label: '• List', style: {} },
    { command: 'insertOrderedList', label: '1. List', style: {} },
];

function RichTextEditor() {
    const editorRef = useRef(null);
    const [html, setHtml] = useState('<p>Start typing...</p>');

    const applyCommand = useCallback((command) => {
        editorRef.current.focus();
        document.execCommand(command, false, null);
        setHtml(editorRef.current.innerHTML);
    }, []);

    const handleInput = () => {
        setHtml(editorRef.current.innerHTML);
    };

    const clearFormatting = () => {
        editorRef.current.focus();
        document.execCommand('removeFormat', false, null);
        setHtml(editorRef.current.innerHTML);
    };

    return (
        <div className="rte">
            <div className="rte-toolbar">
                {TOOLBAR_ACTIONS.map((btn) => (
                    <button
                        key={btn.command}
                        type="button"
                        style={btn.style}
                        onMouseDown={(e) => e.preventDefault()} // keep selection
                        onClick={() => applyCommand(btn.command)}
                    >
                        {btn.label}
                    </button>
                ))}
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={clearFormatting}>
                    Clear
                </button>
            </div>

            <div
                ref={editorRef}
                className="rte-editor"
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                dangerouslySetInnerHTML={{ __html: html }}
            />

            <div className="rte-preview">
                <h4>HTML Output</h4>
                <pre>{html}</pre>
            </div>
        </div>
    );
}

export default RichTextEditor;
```

### CSS

```css
.rte {
    max-width: 640px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
}

.rte-toolbar {
    display: flex;
    gap: 4px;
    padding: 8px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
}

.rte-toolbar button {
    min-width: 32px;
    padding: 6px 10px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 4px;
    cursor: pointer;
}

.rte-toolbar button:hover {
    background: #eef2ff;
}

.rte-editor {
    min-height: 160px;
    padding: 16px;
    outline: none;
}

.rte-editor:empty::before {
    content: 'Start typing...';
    color: #9ca3af;
}

.rte-preview {
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    padding: 12px 16px;
}

.rte-preview pre {
    white-space: pre-wrap;
    font-size: 12px;
    color: #374151;
}
```

### Explanation
1. `contentEditable` turns the `div` into an editable region directly in the DOM.
2. `document.execCommand(command)` (still broadly supported for simple RTE demos, though deprecated) applies formatting like bold/italic to the current selection.
3. `onMouseDown` on toolbar buttons calls `e.preventDefault()` so the editor doesn't lose text selection/focus before the click registers.
4. React only sets `innerHTML` once via `dangerouslySetInnerHTML` on initial render; after that, the DOM is the source of truth and `onInput` syncs state for the preview, avoiding cursor-jump issues caused by re-rendering the editable div on every keystroke.
5. A CSS `:empty::before` placeholder mimics a native placeholder since `contentEditable` elements don't support the `placeholder` attribute.

### Usage Example

```jsx
<RichTextEditor />
```

### Best Practices
- For production editors prefer a maintained library (Slate, Lexical, TipTap) — `execCommand` is deprecated and behaves inconsistently across browsers.
- Never re-render the `contentEditable` node's children from state on every input; only sync state for display purposes.
- Sanitize `innerHTML` before persisting/rendering elsewhere to prevent XSS.
- Keep toolbar buttons `type="button"` so they don't submit a surrounding form.

---

## 3. Kanban Board (Drag Columns & Cards)

### Question
Build a Trello-style Kanban board with multiple columns; cards can be dragged and dropped both within a column (to reorder) and across columns.

### Solution

```jsx
import React, { useState } from 'react';

const initialData = {
    todo: { id: 'todo', title: 'To Do', cardIds: ['c1', 'c2'] },
    'in-progress': { id: 'in-progress', title: 'In Progress', cardIds: ['c3'] },
    done: { id: 'done', title: 'Done', cardIds: [] },
};

const initialCards = {
    c1: { id: 'c1', text: 'Design login page' },
    c2: { id: 'c2', text: 'Set up CI pipeline' },
    c3: { id: 'c3', text: 'Write API docs' },
};

const columnOrder = ['todo', 'in-progress', 'done'];

function KanbanBoard() {
    const [columns, setColumns] = useState(initialData);
    const [cards] = useState(initialCards);
    const [dragInfo, setDragInfo] = useState(null); // { cardId, fromColumnId }

    const handleDragStart = (cardId, fromColumnId) => {
        setDragInfo({ cardId, fromColumnId });
    };

    const handleDragOverCard = (e) => {
        e.preventDefault();
    };

    const handleDropOnCard = (toColumnId, targetCardId) => {
        if (!dragInfo) return;
        moveCard(dragInfo.cardId, dragInfo.fromColumnId, toColumnId, targetCardId);
        setDragInfo(null);
    };

    const handleDropOnColumn = (toColumnId) => {
        if (!dragInfo) return;
        moveCard(dragInfo.cardId, dragInfo.fromColumnId, toColumnId, null);
        setDragInfo(null);
    };

    const moveCard = (cardId, fromColumnId, toColumnId, targetCardId) => {
        setColumns((prev) => {
            const fromIds = prev[fromColumnId].cardIds.filter((id) => id !== cardId);
            const toIds =
                fromColumnId === toColumnId ? fromIds : [...prev[toColumnId].cardIds];

            let insertAt = toIds.length;
            if (targetCardId) {
                const idx = toIds.indexOf(targetCardId);
                insertAt = idx === -1 ? toIds.length : idx;
            }
            toIds.splice(insertAt, 0, cardId);

            return {
                ...prev,
                [fromColumnId]: { ...prev[fromColumnId], cardIds: fromIds },
                [toColumnId]: { ...prev[toColumnId], cardIds: toIds },
            };
        });
    };

    return (
        <div className="kanban-board">
            {columnOrder.map((colId) => {
                const column = columns[colId];
                return (
                    <div
                        key={colId}
                        className="kanban-column"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropOnColumn(colId)}
                    >
                        <div className="kanban-column-header">
                            {column.title}
                            <span className="kanban-count">{column.cardIds.length}</span>
                        </div>
                        <div className="kanban-cards">
                            {column.cardIds.map((cardId) => (
                                <div
                                    key={cardId}
                                    className="kanban-card"
                                    draggable
                                    onDragStart={() => handleDragStart(cardId, colId)}
                                    onDragOver={handleDragOverCard}
                                    onDrop={(e) => {
                                        e.stopPropagation();
                                        handleDropOnCard(colId, cardId);
                                    }}
                                >
                                    {cards[cardId].text}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default KanbanBoard;
```

### CSS

```css
.kanban-board {
    display: flex;
    gap: 16px;
    padding: 16px;
    align-items: flex-start;
}

.kanban-column {
    width: 260px;
    background: #f4f5f7;
    border-radius: 8px;
    padding: 8px;
    min-height: 200px;
}

.kanban-column-header {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    padding: 8px;
}

.kanban-count {
    color: #6b7280;
    font-weight: 400;
}

.kanban-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 40px;
}

.kanban-card {
    background: white;
    border-radius: 6px;
    padding: 10px 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    cursor: grab;
}

.kanban-card:active {
    cursor: grabbing;
    opacity: 0.6;
}
```

### Explanation
1. State is normalized: `columns` maps a column id to its ordered `cardIds`, and `cards` is a flat lookup by id — this is the standard Kanban data shape (mirrors the classic react-beautiful-dnd example) and avoids duplicating card data across columns.
2. Native HTML5 Drag and Drop API (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) is used instead of a library to keep the solution dependency-free.
3. `onDragStart` records which card is moving and from which column.
4. Dropping directly on a card (`handleDropOnCard`) inserts the dragged card immediately before the target card — enabling reorder-within-column.
5. Dropping on empty column space (`handleDropOnColumn`) appends the card to the end of that column.
6. `e.stopPropagation()` on the card's drop handler prevents the column's own `onDrop` from also firing.
7. `moveCard` immutably rebuilds both the source and destination column's `cardIds` arrays.

### Usage Example

```jsx
<KanbanBoard />
```

### Best Practices
- Normalize board state (columns + cards by id) rather than nesting full card objects inside columns — makes updates O(1) and avoids duplication bugs.
- `onDragOver` must call `e.preventDefault()` or the browser will refuse to fire `onDrop`.
- For touch-device support, use a library like `@dnd-kit` or `react-beautiful-dnd` since native HTML5 DnD doesn't work on mobile.
- Add visual drop-indicator styling (e.g., a highlighted line) for a production-quality UX.

---

## 4. Date Picker / Calendar Widget

### Question
Build a calendar date picker that displays a month grid, lets the user navigate between months, and select a single date.

### Solution

```jsx
import React, { useState } from 'react';

function getMonthMatrix(year, month) {
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function isSameDate(a, b) {
    return (
        a &&
        b &&
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function DatePicker() {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(null);

    const weeks = getMonthMatrix(viewYear, viewMonth);

    const goPrevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear((y) => y - 1);
        } else {
            setViewMonth((m) => m - 1);
        }
    };

    const goNextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear((y) => y + 1);
        } else {
            setViewMonth((m) => m + 1);
        }
    };

    const selectDay = (day) => {
        if (!day) return;
        setSelectedDate(new Date(viewYear, viewMonth, day));
    };

    return (
        <div className="datepicker">
            <div className="datepicker-header">
                <button onClick={goPrevMonth} aria-label="Previous month">‹</button>
                <span>{MONTH_NAMES[viewMonth]} {viewYear}</span>
                <button onClick={goNextMonth} aria-label="Next month">›</button>
            </div>

            <div className="datepicker-weekdays">
                {WEEKDAYS.map((w) => (
                    <div key={w} className="weekday-cell">{w}</div>
                ))}
            </div>

            {weeks.map((week, wi) => (
                <div className="datepicker-week" key={wi}>
                    {week.map((day, di) => {
                        const cellDate = day ? new Date(viewYear, viewMonth, day) : null;
                        const isToday = isSameDate(cellDate, today);
                        const isSelected = isSameDate(cellDate, selectedDate);
                        return (
                            <button
                                key={di}
                                className={`day-cell ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                                disabled={!day}
                                onClick={() => selectDay(day)}
                            >
                                {day || ''}
                            </button>
                        );
                    })}
                </div>
            ))}

            <div className="datepicker-footer">
                {selectedDate
                    ? `Selected: ${selectedDate.toDateString()}`
                    : 'No date selected'}
            </div>
        </div>
    );
}

export default DatePicker;
```

### CSS

```css
.datepicker {
    width: 280px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    font-family: sans-serif;
}

.datepicker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    margin-bottom: 8px;
}

.datepicker-header button {
    border: none;
    background: none;
    font-size: 18px;
    cursor: pointer;
    padding: 4px 8px;
}

.datepicker-weekdays,
.datepicker-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
}

.weekday-cell {
    font-size: 12px;
    color: #6b7280;
    padding: 4px 0;
}

.day-cell {
    border: none;
    background: none;
    padding: 8px 0;
    cursor: pointer;
    border-radius: 50%;
}

.day-cell.empty {
    cursor: default;
}

.day-cell:not(.empty):hover {
    background: #eef2ff;
}

.day-cell.today {
    font-weight: 700;
    color: #4f46e5;
}

.day-cell.selected {
    background: #4f46e5;
    color: white;
}

.datepicker-footer {
    margin-top: 8px;
    font-size: 13px;
    color: #374151;
    text-align: center;
}
```

### Explanation
1. `getMonthMatrix` computes a 2D array of weeks: it pads leading cells with `null` for days before the 1st (based on `firstDay.getDay()`), fills in the real day numbers, and pads trailing cells so the grid always has complete weeks of 7.
2. `viewYear`/`viewMonth` track which month is displayed, independent of `selectedDate`.
3. Navigating past December/January wraps the month and adjusts the year.
4. `isSameDate` compares calendar dates (ignoring time) to highlight "today" and the "selected" cell.
5. Empty cells render as disabled, unlabeled buttons to keep the grid alignment intact without being clickable.

### Usage Example

```jsx
<DatePicker />
```

### Best Practices
- Keep "displayed month" state separate from "selected date" state so browsing months doesn't clear the selection.
- Use `aria-label` on prev/next buttons since they only contain glyphs.
- For range selection (start/end), track two dates and highlight everything between them.
- Watch out for timezone bugs — build dates from `(year, month, day)` locally rather than parsing ISO strings with `new Date(str)`.

---

## 5. Toast / Notification System

### Question
Build a toast notification system: any part of the app can call `toast.show(message, type)` to push a toast that auto-dismisses after a few seconds, with manual close and stacking of multiple toasts.

### Solution

```jsx
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        clearTimeout(timers.current[id]);
        delete timers.current[id];
    }, []);

    const showToast = useCallback(
        (message, type = 'info', duration = 3000) => {
            const id = ++idCounter;
            setToasts((prev) => [...prev, { id, message, type }]);
            timers.current[id] = setTimeout(() => removeToast(id), duration);
            return id;
        },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast-${t.type}`}>
                        <span>{t.message}</span>
                        <button className="toast-close" onClick={() => removeToast(t.id)}>
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a ToastProvider');
    return ctx;
}

// Example consumer component
function DemoControls() {
    const { showToast } = useToast();
    return (
        <div className="demo-controls">
            <button onClick={() => showToast('Saved successfully', 'success')}>Success</button>
            <button onClick={() => showToast('Something went wrong', 'error')}>Error</button>
            <button onClick={() => showToast('Heads up, check this', 'warning')}>Warning</button>
            <button onClick={() => showToast('FYI, just letting you know', 'info')}>Info</button>
        </div>
    );
}

function App() {
    return (
        <ToastProvider>
            <DemoControls />
        </ToastProvider>
    );
}

export default App;
```

### CSS

```css
.toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 2000;
}

.toast {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-width: 240px;
    padding: 12px 16px;
    border-radius: 8px;
    color: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: toast-in 0.2s ease-out;
}

@keyframes toast-in {
    from { transform: translateX(16px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.toast-success { background: #16a34a; }
.toast-error { background: #dc2626; }
.toast-warning { background: #d97706; }
.toast-info { background: #2563eb; }

.toast-close {
    background: none;
    border: none;
    color: inherit;
    font-size: 16px;
    cursor: pointer;
    line-height: 1;
}
```

### Explanation
1. A `ToastProvider` holds the list of active toasts in state and renders them in a fixed-position container so any descendant can trigger one via context.
2. `showToast` assigns a unique incrementing id, appends the toast, and schedules a `setTimeout` to auto-remove it — the timer id is stashed in a `ref` keyed by toast id so it can be cancelled if the user manually closes it first.
3. `removeToast` filters the toast out of state and clears any pending timer to avoid a stale timeout trying to remove an already-removed toast.
4. `useToast` is the consumer hook; it throws if used outside the provider, catching a common integration mistake early.
5. Multiple toasts stack via flexbox `column` in the container, newest at the bottom.

### Usage Example

```jsx
<ToastProvider>
    <YourApp />
</ToastProvider>

// anywhere inside:
const { showToast } = useToast();
showToast('Profile updated!', 'success');
```

### Best Practices
- Always clear the dismiss timer when a toast is removed manually to prevent acting on stale ids.
- Cap the max number of simultaneous toasts (e.g., drop the oldest) to avoid overwhelming the screen.
- Use `aria-live="polite"` on the toast container so screen readers announce new toasts.
- Keep the context's public API small (`showToast`/`removeToast`) — internal id generation and timer bookkeeping stay private to the provider.

---

## 6. Multi-Step Form Wizard with Validation

### Question
Build a multi-step signup wizard (e.g., Account → Profile → Confirm) with a progress indicator, per-step validation that blocks advancing on error, and the ability to go back without losing previously entered data.

### Solution

```jsx
import React, { useState } from 'react';

const STEPS = ['Account', 'Profile', 'Confirm'];

function validateStep(step, data) {
    const errors = {};
    if (step === 0) {
        if (!data.email.includes('@')) errors.email = 'Enter a valid email';
        if (data.password.length < 6) errors.password = 'Password must be at least 6 characters';
    } else if (step === 1) {
        if (!data.firstName.trim()) errors.firstName = 'First name is required';
        if (!data.lastName.trim()) errors.lastName = 'Last name is required';
    }
    return errors;
}

function FormWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const goNext = () => {
        const stepErrors = validateStep(currentStep, formData);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            return;
        }
        setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const goBack = () => {
        setErrors({});
        setCurrentStep((s) => Math.max(s - 1, 0));
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="wizard wizard-done">
                <h3>Welcome, {formData.firstName}!</h3>
                <p>Your account for {formData.email} has been created.</p>
            </div>
        );
    }

    return (
        <div className="wizard">
            <div className="wizard-progress">
                {STEPS.map((label, index) => (
                    <div key={label} className="wizard-step-indicator">
                        <div
                            className={`step-circle ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                        >
                            {index < currentStep ? '✓' : index + 1}
                        </div>
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            <div className="wizard-body">
                {currentStep === 0 && (
                    <>
                        <label>
                            Email
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateField('email', e.target.value)}
                            />
                            {errors.email && <span className="field-error">{errors.email}</span>}
                        </label>
                        <label>
                            Password
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => updateField('password', e.target.value)}
                            />
                            {errors.password && <span className="field-error">{errors.password}</span>}
                        </label>
                    </>
                )}

                {currentStep === 1 && (
                    <>
                        <label>
                            First Name
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => updateField('firstName', e.target.value)}
                            />
                            {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                        </label>
                        <label>
                            Last Name
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => updateField('lastName', e.target.value)}
                            />
                            {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                        </label>
                    </>
                )}

                {currentStep === 2 && (
                    <div className="wizard-summary">
                        <p><strong>Email:</strong> {formData.email}</p>
                        <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                    </div>
                )}
            </div>

            <div className="wizard-actions">
                {currentStep > 0 && <button onClick={goBack}>Back</button>}
                {currentStep < STEPS.length - 1 ? (
                    <button onClick={goNext}>Next</button>
                ) : (
                    <button onClick={handleSubmit}>Submit</button>
                )}
            </div>
        </div>
    );
}

export default FormWizard;
```

### CSS

```css
.wizard {
    max-width: 420px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
}

.wizard-progress {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
}

.wizard-step-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #6b7280;
    flex: 1;
}

.step-circle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #d1d5db;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #6b7280;
}

.step-circle.active {
    border-color: #4f46e5;
    color: #4f46e5;
}

.step-circle.completed {
    background: #4f46e5;
    border-color: #4f46e5;
    color: white;
}

.wizard-body label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 16px;
    font-size: 14px;
}

.wizard-body input {
    padding: 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
}

.field-error {
    color: #dc2626;
    font-size: 12px;
}

.wizard-actions {
    display: flex;
    justify-content: space-between;
}
```

### Explanation
1. All form fields live in a single `formData` object at the wizard level (not per-step state), so switching steps back and forth never loses data.
2. `validateStep` is pure and only checks the fields relevant to the given step index, returning an `errors` object.
3. `goNext` validates the current step before allowing `currentStep` to advance; if there are errors, it sets them and bails out without navigating.
4. `updateField` clears a field's error as soon as the user edits it, giving immediate feedback instead of waiting for the next validation pass.
5. The last step renders a read-only summary; submitting flips a `submitted` flag to show a confirmation view.

### Usage Example

```jsx
<FormWizard />
```

### Best Practices
- Validate per-step (not the whole form at once) so users aren't shown irrelevant errors from steps they haven't reached.
- Keep all wizard data in one object at the top level rather than per-step local state, so Back/Next never discards input.
- Disable the Next button (or show inline errors) rather than silently doing nothing on invalid input.
- For real apps, persist `formData` to `sessionStorage` so an accidental refresh doesn't lose progress.

---

## 7. Resizable Split Pane

### Question
Build a two-panel layout with a draggable divider that resizes both panels, constrained to a minimum width on each side.

### Solution

```jsx
import React, { useCallback, useEffect, useRef, useState } from 'react';

function SplitPane({ minLeftWidth = 150, minRightWidth = 150 }) {
    const containerRef = useRef(null);
    const [leftWidth, setLeftWidth] = useState(300);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseMove = useCallback(
        (e) => {
            if (!isDragging || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const containerWidth = containerRect.width;
            let newLeftWidth = e.clientX - containerRect.left;

            newLeftWidth = Math.max(minLeftWidth, newLeftWidth);
            newLeftWidth = Math.min(containerWidth - minRightWidth, newLeftWidth);

            setLeftWidth(newLeftWidth);
        },
        [isDragging, minLeftWidth, minRightWidth]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div className="split-pane" ref={containerRef}>
            <div className="split-pane-left" style={{ width: leftWidth }}>
                <h4>Left Panel</h4>
                <p>Resize me by dragging the divider.</p>
            </div>
            <div
                className={`split-pane-divider ${isDragging ? 'dragging' : ''}`}
                onMouseDown={handleMouseDown}
            />
            <div className="split-pane-right">
                <h4>Right Panel</h4>
                <p>This panel takes up the remaining space.</p>
            </div>
        </div>
    );
}

export default SplitPane;
```

### CSS

```css
.split-pane {
    display: flex;
    height: 320px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    user-select: none;
}

.split-pane-left {
    flex-shrink: 0;
    padding: 16px;
    background: #f9fafb;
    overflow: auto;
}

.split-pane-right {
    flex: 1;
    padding: 16px;
    overflow: auto;
}

.split-pane-divider {
    width: 6px;
    flex-shrink: 0;
    background: #e5e7eb;
    cursor: col-resize;
}

.split-pane-divider:hover,
.split-pane-divider.dragging {
    background: #4f46e5;
}
```

### Explanation
1. `leftWidth` state (in pixels) directly sets the left panel's width; the right panel uses `flex: 1` to fill whatever remains.
2. `onMouseDown` on the divider starts a drag; the actual tracking listeners (`mousemove`/`mouseup`) are attached to `window` rather than the divider, so dragging still works even if the cursor moves faster than the divider element (common with thin drag handles).
3. `handleMouseMove` computes the new width relative to the container's left edge (`e.clientX - containerRect.left`) and clamps it between `minLeftWidth` and `(containerWidth - minRightWidth)` so neither panel can be resized below its minimum.
4. Listeners are added/removed in a `useEffect` keyed on `isDragging`, so they're only live during an active drag — avoiding unnecessary work and memory leaks.
5. `user-select: none` on the container prevents text selection from being triggered while dragging.

### Usage Example

```jsx
<SplitPane minLeftWidth={200} minRightWidth={200} />
```

### Best Practices
- Attach `mousemove`/`mouseup` to `window`, not the divider element, so the drag doesn't break when the pointer leaves the handle.
- Always clamp the resized dimension against both minimums (and the container's total size) to avoid negative or overflowing widths.
- Disable text selection (`user-select: none`) during drag for a smoother UX.
- For touch support, add equivalent `touchstart`/`touchmove`/`touchend` handlers.

---

## 8. OTP / PIN Verification Input with Auto-Focus

### Question
Build a 6-digit OTP input made of individual boxes: typing a digit auto-advances focus to the next box, backspace on an empty box moves focus back, and pasting a full code fills all boxes at once.

### Solution

```jsx
import React, { useRef, useState } from 'react';

function OtpInput({ length = 6, onComplete }) {
    const [values, setValues] = useState(Array(length).fill(''));
    const inputRefs = useRef([]);

    const focusInput = (index) => {
        inputRefs.current[index]?.focus();
    };

    const updateValues = (newValues) => {
        setValues(newValues);
        if (newValues.every((v) => v !== '')) {
            onComplete?.(newValues.join(''));
        }
    };

    const handleChange = (index, rawValue) => {
        const digit = rawValue.replace(/\D/g, '').slice(-1); // keep only last typed digit
        const newValues = [...values];
        newValues[index] = digit;
        updateValues(newValues);

        if (digit && index < length - 1) {
            focusInput(index + 1);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (values[index]) {
                const newValues = [...values];
                newValues[index] = '';
                updateValues(newValues);
            } else if (index > 0) {
                focusInput(index - 1);
                const newValues = [...values];
                newValues[index - 1] = '';
                updateValues(newValues);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            focusInput(index - 1);
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            focusInput(index + 1);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (!pasted) return;
        const newValues = Array(length).fill('');
        for (let i = 0; i < pasted.length; i++) newValues[i] = pasted[i];
        updateValues(newValues);
        focusInput(Math.min(pasted.length, length - 1));
    };

    return (
        <div className="otp-input" onPaste={handlePaste}>
            {values.map((value, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-box"
                    value={value}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                />
            ))}
        </div>
    );
}

export default OtpInput;
```

### CSS

```css
.otp-input {
    display: flex;
    gap: 10px;
}

.otp-box {
    width: 44px;
    height: 52px;
    text-align: center;
    font-size: 22px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    outline: none;
}

.otp-box:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}
```

### Explanation
1. Each digit lives in its own `<input maxLength={1}>`; `inputRefs` is an array of refs so any box's focus can be imperatively controlled.
2. `handleChange` strips non-digits and keeps only the last character typed (guards against pasting or fast typing producing multiple characters in one box), then auto-advances to the next box.
3. `handleKeyDown` implements the classic OTP backspace behavior: clear the current box if it has a value; if it's already empty, move focus to the previous box and clear that one — matching native OTP UX (e.g., bank/2FA inputs).
4. `handlePaste` is bound once on the container (paste events bubble), extracts digits from clipboard text, and distributes them across all boxes starting at index 0, then focuses the last filled box.
5. `onComplete` fires once every box has a value, concatenating them into the final code.

### Usage Example

```jsx
<OtpInput length={6} onComplete={(code) => console.log('Entered OTP:', code)} />
```

### Best Practices
- Use `inputMode="numeric"` (and optionally `pattern="[0-9]*"`) to bring up the numeric keypad on mobile without restricting to `type="number"` (which adds unwanted spinners).
- Handle paste at the container level so users can paste an SMS-copied code in one action instead of per-box.
- Always strip non-digit characters defensively, since paste/autofill can inject whitespace or formatting.
- Clear and refocus appropriately on backspace so keyboard-only users get a smooth left-to-right correction flow.

---

## 9. Pagination Component

### Question
Build a pagination control for a list of items: shows page numbers with ellipses for large ranges, Previous/Next buttons, and highlights the current page.

### Solution

```jsx
import React, { useState } from 'react';

function getPageNumbers(current, total, siblingCount = 1) {
    const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2 ellipses
    if (total <= totalNumbers) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(current - siblingCount, 1);
    const rightSibling = Math.min(current + siblingCount, total);

    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < total - 1;

    const pages = [1];

    if (showLeftEllipsis) pages.push('left-ellipsis');
    for (let i = leftSibling; i <= rightSibling; i++) {
        if (i !== 1 && i !== total) pages.push(i);
    }
    if (showRightEllipsis) pages.push('right-ellipsis');

    pages.push(total);
    return pages;
}

function Pagination({ totalItems, pageSize = 10, onPageChange }) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const goToPage = (page) => {
        const clamped = Math.min(Math.max(page, 1), totalPages);
        setCurrentPage(clamped);
        onPageChange?.(clamped);
    };

    const pages = getPageNumbers(currentPage, totalPages);

    return (
        <nav className="pagination" aria-label="Pagination">
            <button
                className="page-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Previous
            </button>

            {pages.map((page, index) =>
                typeof page === 'number' ? (
                    <button
                        key={page}
                        className={`page-btn ${page === currentPage ? 'active' : ''}`}
                        onClick={() => goToPage(page)}
                        aria-current={page === currentPage ? 'page' : undefined}
                    >
                        {page}
                    </button>
                ) : (
                    <span key={page + index} className="page-ellipsis">…</span>
                )
            )}

            <button
                className="page-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Next
            </button>
        </nav>
    );
}

export default Pagination;
```

### CSS

```css
.pagination {
    display: flex;
    align-items: center;
    gap: 6px;
}

.page-btn {
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.page-btn:hover:not(:disabled) {
    background: #eef2ff;
}

.page-btn.active {
    background: #4f46e5;
    border-color: #4f46e5;
    color: white;
}

.page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.page-ellipsis {
    padding: 0 4px;
    color: #9ca3af;
}
```

### Explanation
1. `getPageNumbers` builds the compact page list: always shows page 1 and the last page, plus a window of `siblingCount` pages around the current page, collapsing far-away ranges into a `'left-ellipsis'` / `'right-ellipsis'` marker.
2. If the total page count is small enough to show in full, it skips ellipsis logic entirely and lists every page.
3. `goToPage` clamps the requested page between `1` and `totalPages` before committing it to state, so Previous/Next can't be pushed out of range.
4. Ellipsis entries are non-numeric strings and rendered as plain, non-interactive `<span>`s, distinguishable from page-number buttons.
5. `aria-current="page"` marks the active page button for assistive tech.

### Usage Example

```jsx
<Pagination
    totalItems={245}
    pageSize={10}
    onPageChange={(page) => console.log('Fetch data for page', page)}
/>
```

### Best Practices
- Clamp page navigation so Previous/Next (and any externally-driven `goToPage` call) can never go out of `[1, totalPages]`.
- Disable Previous on page 1 and Next on the last page rather than letting them silently no-op.
- Use unique, stable keys for ellipsis placeholders (e.g., `'left-ellipsis'`/`'right-ellipsis'`) since there are at most two and they aren't data-driven.
- Keep the component controlled-friendly: accept `currentPage`/`onPageChange` as props in real apps so a parent can drive pagination alongside data fetching.

---

## Key Patterns

1. **Keyboard-Driven UI**: Global shortcuts, arrow-key navigation, focus management (Command Palette, OTP Input)
2. **contentEditable & execCommand**: Building editors directly on the DOM without re-rendering on every keystroke
3. **Native Drag and Drop**: `draggable`, `onDragStart/Over/Drop` for reorderable, cross-container lists (Kanban)
4. **Date Math**: Building calendar grids from `Date` APIs, handling month/year rollover
5. **Context-based Singletons**: App-wide systems like toasts exposed via a provider + hook
6. **Multi-Step State**: Keeping a single source of truth across wizard steps with per-step validation
7. **Pointer-Driven Resize**: Window-level `mousemove`/`mouseup` listeners for drag interactions outside the triggering element
8. **Compact Pagination Math**: Windowing + ellipsis collapsing for large page counts

## Best Practices

- ✅ Clean up global listeners (`window.addEventListener`) in `useEffect` cleanup functions
- ✅ Keep source-of-truth state at the right level (whole-wizard data, normalized Kanban board) to avoid data loss or duplication
- ✅ Clamp/validate all user-driven numeric state (pagination, split pane widths) against sane bounds
- ✅ Use semantic ARIA roles/attributes (`listbox`, `option`, `aria-current`, `aria-live`) for accessibility
- ✅ Prevent default behavior precisely where needed (`onDragOver`, `onMouseDown` on toolbar buttons) without over-blocking other interactions
- ✅ Favor native browser APIs (Drag and Drop, `contentEditable`) for interview-scope solutions, while noting production alternatives (dnd-kit, Slate/Lexical)
