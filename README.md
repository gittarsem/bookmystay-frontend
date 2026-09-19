# 🏨 BookMyStay — Frontend

> A modern React + TypeScript frontend for **BookMyStay**, a full-stack hotel booking platform with guest, owner, and admin experiences.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

<p align="center">
  <b>A full-stack hotel booking platform built with Java, Spring Boot, PostgreSQL, Redis, Elasticsearch, Kafka and Razorpay.</b>
</p>

<p align="center">
  <a href="https://bookmystay-frontend-one.vercel.app">Live</a>
  •
  <a href="https://github.com/gittarsem/BookMyStay">Backend</a>
  •
  <a href="https://github.com/gittarsem/BookMyStay-Frontend">Frontend</a>
</p>


---

## 📌 Overview

BookMyStay is a hotel booking platform where users can discover hotels, select rooms, make bookings, complete payments, and manage their stays.

The frontend provides separate experiences for:

- 👤 **Guests / Users**
- 🏨 **Hotel Owners**
- 🛡️ **Administrators**

The application communicates with the BookMyStay Spring Boot backend through REST APIs and uses JWT-based authentication.

---

## ✨ Features

### 👤 Guest / User

- User registration and login
- Hotel discovery and search
- Hotel details and room selection
- Availability-based booking
- Guest management
- Razorpay payment flow
- Booking confirmation and failure handling
- Booking history and details
- Review creation and editing
- Help, contact, terms, and privacy pages

### 🏨 Owner

Approved owners get access to property-management functionality:

- Owner dashboard
- Create and manage hotels
- Hotel details management
- Room management
- Inventory management
- Booking management
- Revenue overview
- Review management
- Owner verification workflow
- Verification resubmission
- Owner settings

### 🛡️ Admin

Administrators get platform-level management functionality:

- Admin dashboard
- User management
- Hotel management
- Owner verification
- Verification review and administration

---

## 🔐 Role-Based Access

```text
USER
 │
 ├── Browse hotels
 ├── Search availability
 ├── Book rooms
 ├── Manage bookings
 └── Write reviews
       │
       ▼
Apply for Owner
       │
       ▼
Admin Verification
       │
 ┌─────┴─────┐
 │           │
Approved   Rejected
 │           │
 ▼           ▼
OWNER     Resubmit
 │
 ├── Manage hotels
 ├── Manage rooms
 ├── Manage inventory
 ├── Manage bookings
 ├── View revenue
 └── Manage verification

ADMIN
 │
 ├── Manage users
 ├── Manage hotels
 └── Verify owners
```

Frontend route protection is aligned with the authenticated user's role. Authorization is enforced by the backend; the frontend provides the appropriate navigation and protected application experience.

---

## 🧭 Application Structure

```text
src/
├── components/
├── contexts/
├── hooks/
├── lib/
├── pages/
├── services/
├── types/
└── ...
```

The application is organized around reusable UI components, page-level experiences, authentication state, API communication, and shared types.

---

## 📄 Main Application Pages

### Guest Experience

```text
Home
Login
Register
SearchResults
HotelDetails
Booking
BookingConfirmation
BookingSuccess
BookingFailed
MyBookings
BookingDetails
ManageGuests
WriteReview
EditReview
About
Contact
HelpCenter
ListingForOwners
Terms
Privacy
```

### Owner Experience

```text
OwnerDashboard
OwnerHotels
OwnerHotelCreate
OwnerHotelDetails
OwnerRooms
OwnerInventory
OwnerBookings
OwnerRevenue
OwnerVerification
OwnerVerificationResubmit
OwnerSettings
```

### Admin Experience

```text
AdminDashboard
AdminHotels
AdminUsers
AdminVerification
```

For detailed page-by-page behavior and screenshots, see [`docs/PAGES.md`](docs/PAGES.md).

---

## 🔑 Authentication

The frontend uses an authentication context to manage the logged-in user's session.

```text
Login / Register
      │
      ▼
Backend Authentication API
      │
      ▼
Access Token + User Information
      │
      ▼
AuthContext
      │
      ▼
Protected Routes
      │
      ▼
Role-Based Application
```

The frontend also handles token refresh and logout through the authentication API.

Detailed authentication documentation: [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md)

---

## 🔄 User Booking Experience

```text
Search
  │
  ▼
Hotel Details
  │
  ▼
Select Room
  │
  ▼
Booking
  │
  ▼
Guest Details
  │
  ▼
Payment
  │
  ▼
Booking Confirmation
  │
  ├── Success
  └── Failed
```

The backend remains responsible for booking validation, inventory reservation, payment verification, and final booking state.

Detailed flow: [`docs/USER-FLOW.md`](docs/USER-FLOW.md)

---

## 🏨 Owner Experience

```text
User
 │
 ▼
Owner Application
 │
 ▼
Admin Verification
 │
 ├── Approved ──► Owner Dashboard
 │
 └── Rejected ──► Resubmission
```

Once approved, the owner can access property-management features through the owner portal.

Detailed owner workflow: [`docs/OWNER-FLOW.md`](docs/OWNER-FLOW.md)

---

## 🛡️ Admin Experience

The admin portal provides platform-level management rather than normal hotel-booking functionality.

```text
Admin Login
    │
    ▼
Admin Dashboard
    │
    ├── Users
    ├── Hotels
    └── Owner Verification
```

Detailed admin workflow: [`docs/ADMIN-FLOW.md`](docs/ADMIN-FLOW.md)

---

## 🎨 UI & Design

BookMyStay uses a consistent luxury-hotel visual language across the application.

The interface focuses on:

- Clear hotel discovery
- Strong visual hierarchy
- Responsive layouts
- Reusable UI components
- Consistent forms and validation
- Role-specific dashboards
- Clear booking/payment states
- Responsive desktop and mobile experiences

---

## 🧰 Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type-safe frontend development |
| Vite | Development and production build tooling |
| Tailwind CSS | Styling |
| React Router / routing layer | Client-side navigation |
| React Query | Server-state management |
| React Hook Form | Form management |
| Zod | Validation |
| Axios | HTTP communication |
| Lucide React | Icons |
| Razorpay JS SDK | Payment checkout |

---

## 🔌 Backend Integration

The frontend communicates with the BookMyStay backend through REST APIs.

```text
┌────────────────────────────┐
│       React Frontend       │
│                            │
│ Pages → Hooks → API Layer  │
└──────────────┬─────────────┘
               │
               │ HTTPS / REST
               ▼
┌────────────────────────────┐
│   BookMyStay Spring Boot   │
│          Backend           │
└────────────────────────────┘
```

The frontend does not directly access PostgreSQL, Redis, Elasticsearch, Kafka, or other backend infrastructure.

Backend architecture is documented separately in the backend repository.

---

## 💳 Payment Integration

The frontend integrates the Razorpay checkout experience.

```text
Request Payment Order
        │
        ▼
Receive Razorpay Order
        │
        ▼
Open Razorpay Checkout
        │
        ▼
Receive Payment Response
        │
        ▼
Send Payment Details to Backend
        │
        ▼
Display Booking Result
```

Payment verification and final payment state are handled by the backend.

---

## 🗂️ Documentation

| Document | Description |
|---|---|
| [`FRONTEND-ARCHITECTURE.md`](docs/FRONTEND-ARCHITECTURE.md) | Frontend architecture and application structure |
| [`PAGES.md`](docs/PAGES.md) | Application pages and screenshots |
| [`AUTHENTICATION.md`](docs/AUTHENTICATION.md) | Authentication and protected-route behavior |
| [`USER-FLOW.md`](docs/USER-FLOW.md) | Guest booking experience |
| [`OWNER-FLOW.md`](docs/OWNER-FLOW.md) | Owner onboarding and property-management workflow |
| [`ADMIN-FLOW.md`](docs/ADMIN-FLOW.md) | Admin portal workflow |
| [`DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Frontend deployment |
| [`DEMO.md`](docs/DEMO.md) | Demo accounts and testing information |

---

## 🚀 Local Development

### Prerequisites

- Node.js
- npm
- Running BookMyStay backend

### Install

```bash
npm install
```

### Environment

Create the appropriate environment file for the frontend and configure the backend API URL.

Example:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Use the actual variable names defined by the project configuration.

### Run Development Server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 🌐 Deployment

The frontend is designed to be deployed as a modern Vite application.

```text
User
 │
 ▼
Frontend Hosting
 │
 │ HTTPS / REST
 ▼
BookMyStay Backend
 │
 ├── PostgreSQL
 ├── Redis
 ├── Elasticsearch
 ├── Kafka
 └── External Services
```

For the actual production deployment configuration, see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## 📸 Screenshots

Recommended screenshots:

```text
docs/screenshots/
├── home.png
├── search.png
├── hotel-details.png
├── booking.png
├── payment.png
├── my-bookings.png
├── owner-dashboard.png
└── admin-dashboard.png
```

The complete screenshot gallery is maintained in [`docs/PAGES.md`](docs/PAGES.md).

---

## 🔗 Related Repository

### Backend

**BookMyStay Backend**

https://github.com/gittarsem/BookMyStay

The backend repository contains the Spring Boot application, authentication and authorization, booking and inventory management, payment processing, Elasticsearch, Redis, Kafka, email service, and Docker configuration.

---

## 🏗️ Documentation Philosophy

The frontend documentation intentionally separates concerns:

```text
README.md
   │
   ├── What the frontend is
   ├── Features
   ├── Roles
   ├── Main pages
   └── Documentation index
          │
          ├── Architecture
          ├── Authentication
          ├── User Flow
          ├── Owner Flow
          ├── Admin Flow
          ├── Deployment
          └── Demo
```

Detailed implementation explanations are kept in their respective documents rather than duplicated throughout the README.

---

## 👨‍💻 Author

**Tarsem Gulab**

B.Tech CSE — IIIT Una

---

## ⭐ BookMyStay

A full-stack hotel booking platform built to demonstrate modern frontend engineering, backend architecture, authentication, booking workflows, payment integration, role-based access, and production-oriented infrastructure.
