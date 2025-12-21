# Library Management System (LLD): Complete Low-Level Design

## Problem Statement

**Context**: Design a library management system for book lending and member management.

**Requirements**:
- Book catalog management
- Member registration and management
- Book borrowing and returns
- Fine calculation for late returns
- Book reservation system
- Search books by title, author, ISBN
- Multiple copies of same book

**Focus**: Low-Level Design (Classes, Design Patterns, SOLID Principles)

---

## Class Diagram

```mermaid
classDiagram
    class Library {
        -String name
        -Address address
        -List~BookItem~ books
        -List~Member~ members
        +addBook(Book book)
        +removeBook(String ISBN)
        +searchByTitle(String title)
        +searchByAuthor(String author)
    }
    
    class Book {
        -String ISBN
        -String title
        -String author
        -String publisher
        -int publicationYear
        -List~BookItem~ items
    }
    
    class BookItem {
        -String barcode
        -Book book
        -BookStatus status
        -Date dateOfPurchase
        -double price
        +checkout(Member member)
        +returnBook()
    }
    
    class Member {
        -String memberId
        -String name
        -String email
        -Date membershipDate
        -int totalBooksCheckedOut
        -List~BookLending~ bookLendings
        +checkoutBook(BookItem item)
        +returnBook(BookItem item)
        +getTotalFine()
    }
    
    class BookLending {
        -String lendingId
        -BookItem bookItem
        -Member member
        -Date issueDate
        -Date dueDate
        -Date returnDate
        -double fine
        +calculateFine()
        +isOverdue()
    }
    
    class BookReservation {
        -String reservationId
        -Book book
        -Member member
        -Date reservationDate
        -ReservationStatus status
        +cancel()
        +complete()
    }
    
    class Librarian {
        -String employeeId
        -String name
        +addBookItem(BookItem item)
        +blockMember(Member member)
        +unblockMember(Member member)
    }
    
    Library "1" *-- "many" Book
    Book "1" *-- "many" BookItem
    Library "1" *-- "many" Member
    Member "1" *-- "many" BookLending
    BookLending "1" --> "1" BookItem
    BookReservation "1" --> "1" Book
    BookReservation "1" --> "1" Member
    
    <<enumeration>> BookStatus
    BookStatus : AVAILABLE
    BookStatus : RESERVED
    BookStatus : LOANED
    BookStatus : LOST
    
    <<enumeration>> ReservationStatus
    ReservationStatus : PENDING
    ReservationStatus : COMPLETED
    ReservationStatus : CANCELLED
```

---

## Implementation

### 1. Core Classes

```javascript
// Enums
const BookStatus = {
    AVAILABLE: 'AVAILABLE',
    RESERVED: 'RESERVED',
    LOANED: 'LOANED',
    LOST: 'LOST'
};

const ReservationStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

// Book class
class Book {
    constructor(ISBN, title, author, publisher, publicationYear) {
        this.ISBN = ISBN;
        this.title = title;
        this.author = author;
        this.publisher = publisher;
        this.publicationYear = publicationYear;
        this.items = [];
    }
    
    addItem(bookItem) {
        this.items.push(bookItem);
    }
    
    getAvailableItems() {
        return this.items.filter(item => item.status === BookStatus.AVAILABLE);
    }
}

// BookItem class (specific copy of a book)
class BookItem {
    constructor(barcode, book, price) {
        this.barcode = barcode;
        this.book = book;
        this.status = BookStatus.AVAILABLE;
        this.dateOfPurchase = new Date();
        this.price = price;
    }
    
    checkout(member) {
        if (this.status !== BookStatus.AVAILABLE) {
            throw new Error('Book is not available for checkout');
        }
        
        this.status = BookStatus.LOANED;
        return new BookLending(this, member);
    }
    
    returnBook() {
        this.status = BookStatus.AVAILABLE;
    }
    
    reserve() {
        if (this.status !== BookStatus.AVAILABLE) {
            throw new Error('Book is not available for reservation');
        }
        this.status = BookStatus.RESERVED;
    }
}

// Member class
class Member {
    constructor(memberId, name, email) {
        this.memberId = memberId;
        this.name = name;
        this.email = email;
        this.membershipDate = new Date();
        this.totalBooksCheckedOut = 0;
        this.bookLendings = [];
        this.maxBooksLimit = 5;
    }
    
    checkoutBook(bookItem) {
        if (this.totalBooksCheckedOut >= this.maxBooksLimit) {
            throw new Error('Maximum book limit reached');
        }
        
        const lending = bookItem.checkout(this);
        this.bookLendings.push(lending);
        this.totalBooksCheckedOut++;
        
        return lending;
    }
    
    returnBook(bookItem) {
        const lending = this.bookLendings.find(l => 
            l.bookItem.barcode === bookItem.barcode && !l.returnDate
        );
        
        if (!lending) {
            throw new Error('Book lending not found');
        }
        
        lending.returnBook();
        this.totalBooksCheckedOut--;
        
        return lending.fine;
    }
    
    getTotalFine() {
        return this.bookLendings
            .filter(l => l.fine > 0)
            .reduce((total, l) => total + l.fine, 0);
    }
}

// BookLending class
class BookLending {
    constructor(bookItem, member) {
        this.lendingId = this.generateId();
        this.bookItem = bookItem;
        this.member = member;
        this.issueDate = new Date();
        this.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
        this.returnDate = null;
        this.fine = 0;
        this.finePerDay = 1.0; // $1 per day
    }
    
    returnBook() {
        this.returnDate = new Date();
        this.bookItem.returnBook();
        
        if (this.isOverdue()) {
            this.calculateFine();
        }
    }
    
    isOverdue() {
        const compareDate = this.returnDate || new Date();
        return compareDate > this.dueDate;
    }
    
    calculateFine() {
        if (!this.isOverdue()) {
            return 0;
        }
        
        const compareDate = this.returnDate || new Date();
        const daysOverdue = Math.ceil(
            (compareDate - this.dueDate) / (24 * 60 * 60 * 1000)
        );
        
        this.fine = daysOverdue * this.finePerDay;
        return this.fine;
    }
    
    generateId() {
        return 'LND-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
}

// BookReservation class
class BookReservation {
    constructor(book, member) {
        this.reservationId = this.generateId();
        this.book = book;
        this.member = member;
        this.reservationDate = new Date();
        this.status = ReservationStatus.PENDING;
        this.expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
    }
    
    cancel() {
        this.status = ReservationStatus.CANCELLED;
    }
    
    complete() {
        this.status = ReservationStatus.COMPLETED;
    }
    
    isExpired() {
        return new Date() > this.expiryDate;
    }
    
    generateId() {
        return 'RES-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
}

// Library class (Facade Pattern)
class Library {
    constructor(name, address) {
        this.name = name;
        this.address = address;
        this.books = new Map(); // ISBN -> Book
        this.bookItems = new Map(); // barcode -> BookItem
        this.members = new Map(); // memberId -> Member
        this.reservations = [];
    }
    
    addBook(book) {
        this.books.set(book.ISBN, book);
    }
    
    addBookItem(bookItem) {
        this.bookItems.set(bookItem.barcode, bookItem);
        
        const book = this.books.get(bookItem.book.ISBN);
        if (book) {
            book.addItem(bookItem);
        }
    }
    
    registerMember(member) {
        this.members.set(member.memberId, member);
    }
    
    searchByTitle(title) {
        return Array.from(this.books.values())
            .filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    }
    
    searchByAuthor(author) {
        return Array.from(this.books.values())
            .filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
    }
    
    searchByISBN(ISBN) {
        return this.books.get(ISBN);
    }
    
    checkoutBook(memberId, barcode) {
        const member = this.members.get(memberId);
        const bookItem = this.bookItems.get(barcode);
        
        if (!member) throw new Error('Member not found');
        if (!bookItem) throw new Error('Book item not found');
        
        return member.checkoutBook(bookItem);
    }
    
    returnBook(memberId, barcode) {
        const member = this.members.get(memberId);
        const bookItem = this.bookItems.get(barcode);
        
        if (!member) throw new Error('Member not found');
        if (!bookItem) throw new Error('Book item not found');
        
        return member.returnBook(bookItem);
    }
    
    reserveBook(memberId, ISBN) {
        const member = this.members.get(memberId);
        const book = this.books.get(ISBN);
        
        if (!member) throw new Error('Member not found');
        if (!book) throw new Error('Book not found');
        
        const reservation = new BookReservation(book, member);
        this.reservations.push(reservation);
        
        return reservation;
    }
}
```

---

## Design Patterns Used

### 1. Facade Pattern
- `Library` class provides simple interface to complex subsystem

### 2. Factory Pattern
```javascript
class BookFactory {
    static createBook(type, data) {
        switch (type) {
            case 'PHYSICAL':
                return new PhysicalBook(data);
            case 'EBOOK':
                return new EBook(data);
            case 'AUDIOBOOK':
                return new AudioBook(data);
            default:
                throw new Error('Unknown book type');
        }
    }
}
```

### 3. Strategy Pattern (Fine Calculation)
```javascript
class FineCalculationStrategy {
    calculateFine(daysOverdue) {
        throw new Error('Must implement calculateFine');
    }
}

class StandardFineStrategy extends FineCalculationStrategy {
    calculateFine(daysOverdue) {
        return daysOverdue * 1.0; // $1 per day
    }
}

class PremiumMemberFineStrategy extends FineCalculationStrategy {
    calculateFine(daysOverdue) {
        return daysOverdue * 0.5; // $0.5 per day for premium members
    }
}
```

### 4. Observer Pattern (Notifications)
```javascript
class NotificationService {
    constructor() {
        this.observers = [];
    }
    
    subscribe(observer) {
        this.observers.push(observer);
    }
    
    notify(event) {
        this.observers.forEach(observer => observer.update(event));
    }
}

class EmailNotifier {
    update(event) {
        console.log(`Sending email for event: ${event.type}`);
    }
}

class SMSNotifier {
    update(event) {
        console.log(`Sending SMS for event: ${event.type}`);
    }
}
```

---

## SOLID Principles

### Single Responsibility Principle
- Each class has one responsibility
- `Book` manages book metadata
- `BookItem` manages physical copies
- `BookLending` manages lending transactions

### Open/Closed Principle
- Use inheritance for book types (PhysicalBook, EBook)
- Strategy pattern for fine calculation

### Liskov Substitution Principle
- All book types can be used interchangeably

### Interface Segregation Principle
- Separate interfaces for different user types (Member, Librarian)

### Dependency Inversion Principle
- Depend on abstractions (FineCalculationStrategy) not concretions

---

## Interview Talking Points

1. **How to handle concurrent checkouts?**
   - Database row-level locking
   - Optimistic locking with version numbers
   - Distributed locks for high concurrency

2. **How to scale the system?**
   - Separate read and write databases
   - Cache popular books
   - Shard by library location

3. **How to handle reservations?**
   - Queue system (FIFO)
   - Expiry mechanism
   - Notification when book available

4. **How to calculate fines efficiently?**
   - Batch job to calculate daily
   - Cache member fine totals
   - Strategy pattern for different member types

---

## Next Steps

- Learn [Warehouse Management](../18_Warehouse_Management/18_Warehouse_Management_System.md)
- Study [Parking Lot Reservation](../19_Parking_Lot_Reservation/19_Parking_Lot_Reservation_System.md)
