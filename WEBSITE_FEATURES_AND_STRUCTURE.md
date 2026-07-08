# Enjoy Farm - Platform Documentation & Features

This document provides a comprehensive overview of the **Enjoy Farm** platform following the complete UI/UX and architectural overhaul. It outlines the core features, the premium boutique aesthetic, and the project directory structure.

---

## 🌟 Platform Overview

**Enjoy Farm** is a premium, single-owner private retreat and farmhouse booking platform. The website has been completely transitioned from a generic aggregator/marketplace to a highly curated, luxury portfolio. It features a modern, editorial design language utilizing deep greens (`#1B2A22`), emerald accents (`#00a877`), and gold typography (`#D4AF37`) to convey exclusivity and privacy.

---

## ✨ Key Features & UI/UX Enhancements

### 1. Public-Facing Website (Guest Experience)
*   **Premium Branding:** 
    *   Custom SVG logo typography ("Enjoy Farm") designed to exude luxury.
    *   Glassmorphism effects on the sticky navigation bar.
    *   A beautifully structured, 4-column footer featuring instant WhatsApp/Call actions and detailed contact timings.
*   **Property Detail Pages (`/farms/[id]`):**
    *   **Hero Photo Gallery:** Full-width image showcases capturing the aesthetic of the properties.
    *   **Interactive Booking Sticky Card:** Real-time date selection via `react-datepicker`, automatic pricing calculations, and real-time date conflict/availability validation.
    *   **Luxury Amenities Grid:** A 4-column card grid detailing unique amenities (e.g., Gazebo, Children's Playground, Extra Mattress, Swimming Pool) mapped to bespoke icons.
    *   **House Rules & Cancellation Policies:** Clear, distinct alert banners explaining restrictions (No Alcohol, No Pets, etc.) and cancellation windows.
    *   **Security Deposit Alerts:** Highly visible alert badges prompting guests about security deposits (e.g., ₹5000 Pay at Check-in).
    *   **Interactive Location Maps:** Embedded Google Maps displaying precise coordinates in satellite view with an "Open in Maps" external link CTA.
    *   **Direct Contact ("Need Help?"):** Persistent call and WhatsApp support buttons directly beneath the booking card for instant guest assistance.

### 2. Admin Dashboard & Management backend
*   **Secure Authentication:** Powered by `NextAuth.js`, restricting dashboard access strictly to authenticated administrators.
*   **Centralized Analytics (`/admin/dashboard`):** Real-time metrics tracking revenue, total bookings, active properties, and recent activity logs.
*   **Property Management (`/admin/properties`):** 
    *   Full CRUD capabilities to add, edit, or remove properties.
    *   Advanced creation wizard including selections for newly added luxury amenities.
*   **Reservation Management (`/admin/reservations`):** 
    *   Approve, reject, or manage incoming booking requests.
    *   Detects date clashes automatically to prevent double-booking.
*   **Financial Reports (`/admin/financials`):** Track earnings, filter by date, and manage financial performance.

### 3. Technical Architecture
*   **Database Integration:** Seamless MongoDB integration via Mongoose, dynamically serving all properties, reviews, and bookings instead of static mock data.
*   **Responsive Design:** Fully mobile-optimized layouts using Tailwind CSS, ensuring the premium feel translates perfectly to small screens (collapsing grids, touch-friendly date pickers).

---

## 📁 Project Structure

The platform is built on **Next.js 14+ (App Router)** utilizing **TypeScript** and **Tailwind CSS**.

```text
villa-booking/
├── app/                        # Next.js App Router Core
│   ├── api/                    # Backend API Routes
│   │   ├── auth/               # NextAuth endpoints
│   │   ├── bookings/           # Booking management APIs
│   │   ├── dashboard/          # Admin metrics APIs
│   │   ├── farms/              # Property CRUD APIs
│   │   ├── financials/         # Revenue & tracking APIs
│   │   └── reviews/            # Testimonial APIs
│   ├── admin/                  # Protected Admin Dashboard routes
│   │   ├── dashboard/
│   │   ├── properties/         # Property list and Create Wizard
│   │   ├── reservations/
│   │   └── financials/
│   ├── farms/                  # Public Property Pages
│   │   ├── [id]/               # Dynamic Property Details (The core UI overhaul)
│   │   └── page.tsx            # Property Listing / Collection page
│   ├── login/                  # Authentication pages
│   ├── register/
│   ├── globals.css             # Tailwind & Global Styles
│   └── layout.tsx              # Root HTML Layout & Font Declarations
│
├── components/                 # Reusable React UI Components
│   ├── AuthForm.tsx            # Login/Register UI
│   ├── Footer.tsx              # Premium 4-column Footer with CTA
│   ├── Navbar.tsx              # Sticky Header & Custom SVG Logo
│   └── ...
│
├── models/                     # MongoDB Mongoose Schemas
│   ├── Booking.ts              
│   ├── Farm.ts                 # Extended to support new amenities/rules
│   ├── Review.ts               
│   └── User.ts
│
├── lib/                        # Utilities & Configurations
│   ├── db.ts                   # MongoDB connection logic
│   └── ...
│
├── public/                     # Static Assets (Images, Icons)
├── tailwind.config.ts          # Tailwind Theme & Color Tokens (Green/Gold)
├── next.config.ts              # Next.js & Turbopack configurations
└── package.json                # Dependencies (lucide-react, react-datepicker, etc.)
```

---

## 🚀 Next Steps / Future Enhancements
*   **Payment Gateway Integration:** Implement Razorpay or Stripe to collect the booking amounts and security deposits online.
*   **Automated Email/WhatsApp Notifications:** Trigger automatic confirmations when the admin approves a booking.
*   **Performance Optimization:** Implement advanced image optimization (Next/Image) for heavy property gallery images.
