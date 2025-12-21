# Library Management System (LLD): Visual Diagrams

## 1. Class Diagram - Complete System

```mermaid
classDiagram
    class Library {
        -String name
        -Address address
        -List~BookItem~ books
        -List~Member~ members
        -List~Librarian~ librarians
        +addBook(Book book)
        +removeBook(String ISBN)
        +searchByTitle(String title)
        +searchByAuthor(String author)
        +searchByISBN(String ISBN)
        +registerMember(Member member)
        +checkoutBook(Member member, BookItem item)
        +returnBook(Member member, BookItem item)
    }
    
    class Book {
        -String ISBN
        -String title
        -String author
        -String publisher
        -int publicationYear
        -List~String~ subjects
        -String language
        -List~BookItem~ items
        +addItem(BookItem item)
        +getAvailableItems()
    }
    
    class BookItem {
        -String barcode
        -Book book
        -BookStatus status
        -Date dateOfPurchase
        -double price
        -String rackLocation
        +checkout(Member member)
        +returnBook()
        +reserve(Member member)
        +isAvailable()
    }
    
    class Member {
        -String memberId
        -String name
        -String email
        -String phone
        -Date membershipDate
        -MembershipType type
        -int totalBooksCheckedOut
        -List~BookLending~ bookLendings
        -List~BookReservation~ reservations
        +checkoutBook(BookItem item)
        +returnBook(BookItem item)
        +reserveBook(Book book)
        +getTotalFine()
        +canCheckout()
    }
    
    class BookLending {
        -String lendingId
        -BookItem bookItem
        -Member member
        -Date issueDate
        -Date dueDate
        -Date returnDate
        -double fine
        -LendingStatus status
        +calculateFine()
        +isOverdue()
        +returnBook()
    }
    
    class BookReservation {
        -String reservationId
        -Book book
        -Member member
        -Date reservationDate
        -Date expiryDate
        -ReservationStatus status
        +cancel()
        +complete()
        +isExpired()
    }
    
    class Librarian {
        -String employeeId
        -String name
        -String email
        +addBookItem(BookItem item)
        +blockMember(Member member)
        +unblockMember(Member member)
        +issueBook(Member member, BookItem item)
        +returnBook(BookItem item)
    }
    
    class FineCalculator {
        <<interface>>
        +calculateFine(int daysOverdue) double
    }
    
    class StandardFineCalculator {
        -double finePerDay
        +calculateFine(int daysOverdue) double
    }
    
    class PremiumFineCalculator {
        -double finePerDay
        +calculateFine(int daysOverdue) double
    }
    
    Library "1" *-- "many" Book
    Library "1" *-- "many" Member
    Library "1" *-- "many" Librarian
    Book "1" *-- "many" BookItem
    Member "1" *-- "many" BookLending
    Member "1" *-- "many" BookReservation
    BookLending "1" --> "1" BookItem
    BookLending "1" --> "1" Member
    BookReservation "1" --> "1" Book
    BookReservation "1" --> "1" Member
    FineCalculator <|.. StandardFineCalculator
    FineCalculator <|.. PremiumFineCalculator
    BookLending --> FineCalculator
    
    <<enumeration>> BookStatus
    BookStatus : AVAILABLE
    BookStatus : RESERVED
    BookStatus : LOANED
    BookStatus : LOST
    
    <<enumeration>> ReservationStatus
    ReservationStatus : PENDING
    ReservationStatus : COMPLETED
    ReservationStatus : CANCELLED
    
    <<enumeration>> MembershipType
    MembershipType : STANDARD
    MembershipType : PREMIUM
    MembershipType : STUDENT
```

## 2. Book Checkout Flow

```mermaid
sequenceDiagram
    participant Member
    participant Librarian
    participant Library
    participant BookItem
    participant BookLending
    
    Member->>Librarian: Request to checkout book
    Librarian->>Library: checkoutBook(member, bookItem)
    
    Library->>Member: canCheckout()?
    alt Can Checkout
        Member-->>Library: Yes (< 5 books)
        Library->>BookItem: isAvailable()?
        
        alt Book Available
            BookItem-->>Library: Yes
            Library->>BookItem: checkout(member)
            BookItem->>BookItem: status = LOANED
            BookItem->>BookLending: new BookLending()
            BookLending->>BookLending: issueDate = today<br/>dueDate = today + 14 days
            BookLending-->>Library: Lending created
            Library-->>Librarian: Success
            Librarian-->>Member: Book issued ✓
        else Book Not Available
            BookItem-->>Library: No (Reserved/Loaned)
            Library-->>Librarian: Book not available
            Librarian-->>Member: Cannot checkout
        end
    else Cannot Checkout
        Member-->>Library: No (Limit reached/Fines due)
        Library-->>Librarian: Member cannot checkout
        Librarian-->>Member: Clear fines or return books
    end
```

## 3. Book Return and Fine Calculation

```mermaid
flowchart TD
    Start[Member Returns Book] --> Scan[Scan Barcode]
    Scan --> Find[Find BookLending Record]
    
    Find --> Check{Is Overdue?}
    
    Check -->|No| NoFine[No Fine]
    Check -->|Yes| CalcFine[Calculate Fine]
    
    CalcFine --> Days[Days Overdue =<br/>Return Date - Due Date]
    Days --> Type{Member Type?}
    
    Type -->|Standard| Standard[Fine = Days × $1.00]
    Type -->|Premium| Premium[Fine = Days × $0.50]
    Type -->|Student| Student[Fine = Days × $0.75]
    
    Standard --> Record[Record Fine]
    Premium --> Record
    Student --> Record
    NoFine --> Update[Update BookLending]
    
    Record --> Update
    Update --> Status[Set returnDate = NOW<br/>status = RETURNED]
    Status --> BookStatus[Update BookItem<br/>status = AVAILABLE]
    BookStatus --> Member[Update Member<br/>totalBooksCheckedOut--]
    Member --> Complete[Return Complete]
```

## 4. Book Reservation System

```mermaid
stateDiagram-v2
    [*] --> Pending: Member Reserves Book
    
    Pending --> Completed: Book Available<br/>Member Notified
    Pending --> Cancelled: Member Cancels
    Pending --> Expired: 3 Days Passed<br/>No Pickup
    
    Completed --> [*]: Book Checked Out
    Cancelled --> [*]
    Expired --> [*]: Reservation Removed
    
    note right of Pending
        Reservation valid for 3 days
        Member notified when available
    end note
```

## 5. Search Functionality

```mermaid
flowchart TD
    Search[User Search] --> Type{Search Type?}
    
    Type -->|By Title| Title[Search by Title]
    Type -->|By Author| Author[Search by Author]
    Type -->|By ISBN| ISBN[Search by ISBN]
    Type -->|By Subject| Subject[Search by Subject]
    
    Title --> Filter[Filter Books]
    Author --> Filter
    ISBN --> Filter
    Subject --> Filter
    
    Filter --> Available{Show Only<br/>Available?}
    
    Available -->|Yes| CheckStatus[Filter status = AVAILABLE]
    Available -->|No| AllBooks[Show All Books]
    
    CheckStatus --> Results[Display Results]
    AllBooks --> Results
    
    Results --> Details[Show Book Details<br/>+ Available Copies]
```

## 6. Fine Management

```mermaid
graph TB
    subgraph "Member Fines"
        M1[Member: John Doe]
        M1 --> L1[Lending 1<br/>Overdue: 5 days<br/>Fine: $5.00]
        M1 --> L2[Lending 2<br/>Overdue: 2 days<br/>Fine: $2.00]
        M1 --> Total[Total Fine: $7.00]
    end
    
    subgraph "Payment"
        Total --> Pay{Pay Fine?}
        Pay -->|Yes| Process[Process Payment]
        Pay -->|No| Block[Block Checkout<br/>Until Paid]
    end
    
    subgraph "Actions"
        Process --> Clear[Clear Fine Records]
        Process --> Receipt[Generate Receipt]
        Block --> Notify[Send Reminder Email]
    end
```

## 7. Design Patterns Implementation

```mermaid
graph TB
    subgraph "Facade Pattern"
        Client[Client Code]
        Client --> LibraryFacade[Library Facade]
        LibraryFacade --> BookMgmt[Book Management]
        LibraryFacade --> MemberMgmt[Member Management]
        LibraryFacade --> LendingMgmt[Lending Management]
    end
    
    subgraph "Strategy Pattern"
        Lending[BookLending]
        Lending --> FineCalc[FineCalculator Interface]
        FineCalc --> Standard[StandardFineCalculator]
        FineCalc --> Premium[PremiumFineCalculator]
        FineCalc --> Student[StudentFineCalculator]
    end
    
    subgraph "Observer Pattern"
        Event[Book Available Event]
        Event --> Notify[NotificationService]
        Notify --> Email[EmailNotifier]
        Notify --> SMS[SMSNotifier]
        Notify --> Push[PushNotifier]
    end
```

## 8. Database Schema

```mermaid
erDiagram
    BOOKS ||--o{ BOOK_ITEMS : contains
    MEMBERS ||--o{ BOOK_LENDINGS : has
    BOOK_ITEMS ||--o{ BOOK_LENDINGS : involved_in
    MEMBERS ||--o{ BOOK_RESERVATIONS : makes
    BOOKS ||--o{ BOOK_RESERVATIONS : for
    
    BOOKS {
        string ISBN PK
        string title
        string author
        string publisher
        int publication_year
        string language
    }
    
    BOOK_ITEMS {
        string barcode PK
        string ISBN FK
        string status
        date date_of_purchase
        decimal price
        string rack_location
    }
    
    MEMBERS {
        string member_id PK
        string name
        string email
        string phone
        date membership_date
        string membership_type
        int total_books_checked_out
    }
    
    BOOK_LENDINGS {
        string lending_id PK
        string barcode FK
        string member_id FK
        date issue_date
        date due_date
        date return_date
        decimal fine
        string status
    }
    
    BOOK_RESERVATIONS {
        string reservation_id PK
        string ISBN FK
        string member_id FK
        date reservation_date
        date expiry_date
        string status
    }
```

## 9. Member Checkout Limits

```mermaid
flowchart TD
    Request[Checkout Request] --> CheckType{Member Type?}
    
    CheckType -->|Standard| Limit1[Max Books: 5<br/>Duration: 14 days]
    CheckType -->|Premium| Limit2[Max Books: 10<br/>Duration: 21 days]
    CheckType -->|Student| Limit3[Max Books: 3<br/>Duration: 7 days]
    
    Limit1 --> CheckCurrent{Current<br/>Checkouts?}
    Limit2 --> CheckCurrent
    Limit3 --> CheckCurrent
    
    CheckCurrent -->|< Limit| CheckFines{Outstanding<br/>Fines?}
    CheckCurrent -->|>= Limit| Deny1[Deny: Limit Reached]
    
    CheckFines -->|No| Allow[Allow Checkout]
    CheckFines -->|Yes| Deny2[Deny: Pay Fines First]
```

## 10. System Monitoring

```mermaid
graph TB
    subgraph "Library Metrics"
        M1[Total Books: 10,000]
        M2[Available: 7,500]
        M3[Loaned: 2,200]
        M4[Reserved: 300]
    end
    
    subgraph "Member Metrics"
        M5[Active Members: 1,500]
        M6[Books Checked Out: 2,200]
        M7[Overdue Books: 85]
        M8[Total Fines: $425]
    end
    
    subgraph "Daily Activity"
        A1[Checkouts Today: 45]
        A2[Returns Today: 38]
        A3[New Members: 5]
        A4[Reservations: 12]
    end
    
    subgraph "Dashboard"
        Dashboard[Admin Dashboard]
    end
    
    M1 --> Dashboard
    M2 --> Dashboard
    M3 --> Dashboard
    M4 --> Dashboard
    M5 --> Dashboard
    M6 --> Dashboard
    M7 --> Dashboard
    M8 --> Dashboard
    A1 --> Dashboard
    A2 --> Dashboard
    A3 --> Dashboard
    A4 --> Dashboard
```

## SOLID Principles Applied

| Principle | Implementation |
|-----------|----------------|
| **Single Responsibility** | Each class has one responsibility (Book, Member, Lending) |
| **Open/Closed** | FineCalculator interface allows new strategies without modifying existing code |
| **Liskov Substitution** | All FineCalculator implementations are interchangeable |
| **Interface Segregation** | Separate interfaces for different user types (Member, Librarian) |
| **Dependency Inversion** | Depend on FineCalculator interface, not concrete implementations |
