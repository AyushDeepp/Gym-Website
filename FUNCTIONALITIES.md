# Website Functionalities

This document lists all the functionalities implemented in the Elite Gym website.

## Frontend Functionalities

### Navigation & Layout
- Responsive navigation bar with mobile menu
- Smooth page transitions using Framer Motion
- Scroll to top functionality
- Footer with contact information and links

### Home Page
- Fullscreen hero section with call-to-action
- Animated statistics counter (members, trainers, programs, awards)
- Programs carousel/slider showcasing available programs
- Trainers showcase section
- Membership plans preview
- Testimonials section

### About Page
- Gym story and mission section
- Features grid displaying gym amenities and benefits:
  - State-of-the-art equipment
  - Expert trainers
  - Personalized programs
  - Flexible timings
  - Community support
  - Progress tracking

### Programs Page
- Display all available fitness programs
- Program cards showing:
  - Program name and description
  - Duration and difficulty level
  - Features list
  - Pricing information
  - Program images
- Dynamic data fetching from backend API

### Trainers Page
- Display all gym trainers
- Trainer cards showing:
  - Trainer name and photo
  - Specialization and experience
  - Social media links
  - Bio information
- Dynamic data fetching from backend API

### Plans Page
- Display all membership plans
- Plan cards showing:
  - Plan name and price
  - Features and benefits
  - Duration options
  - Razorpay payment integration
- Payment processing functionality
- Demo mode support for testing payments without Razorpay credentials

### Timetable Page
- Weekly class schedule display
- Day selector (Monday through Sunday)
- Class information showing:
  - Class name
  - Trainer name
  - Time and duration
  - Capacity information
- Filter classes by selected day
- Dynamic data fetching from backend API

### Gallery Page
- Image gallery grid layout
- Lightbox functionality for viewing images
- Responsive image grid

### Testimonials Page
- Display customer testimonials
- Testimonial cards with:
  - Customer name and photo
  - Rating stars
  - Review text

### Contact Page
- Contact form with fields:
  - Name (required)
  - Email (required)
  - Phone (optional)
  - Subject (required)
  - Message (required)
- Form submission to backend
- Success/error message display
- Contact information display:
  - Address
  - Phone numbers
  - Email addresses
  - Operating hours

## Backend Functionalities

### Authentication System
- Admin login functionality
- JWT token-based authentication
- Password hashing using bcrypt
- Protected routes middleware
- Super admin role support
- Admin registration (super admin only)
- Get current admin profile
- List all admins
- Update admin details
- Delete admin accounts

### Programs Management
- Create new fitness programs
- Get all programs
- Get single program by ID
- Update program details
- Delete programs
- Program fields:
  - Name, description, duration
  - Difficulty level (Beginner/Intermediate/Advanced)
  - Image URL
  - Features array
  - Price

### Trainers Management
- Create new trainer profiles
- Get all trainers
- Get single trainer by ID
- Update trainer details
- Delete trainers
- Trainer fields:
  - Name, bio, specialization
  - Experience, image
  - Social media links

### Plans Management
- Create new membership plans
- Get all plans
- Get single plan by ID
- Update plan details
- Delete plans
- Plan fields:
  - Name, description, price
  - Duration, features
  - Benefits list

### Timetable Management
- Create new class schedule entries
- Get all timetable entries
- Get timetable by specific day
- Update timetable entries
- Delete timetable entries
- Timetable fields:
  - Day of week
  - Class name
  - Trainer name
  - Time, duration
  - Capacity

### Contact Form Management
- Submit contact form (public)
- Get all contact submissions (admin only)
- Get single contact by ID (admin only)
- Update contact status (admin only)
- Contact fields:
  - Name, email, phone
  - Subject, message
  - Status, timestamps

### Payment Processing
- Create Razorpay payment order
- Verify payment after completion
- Get payment details by ID
- Get all payments (admin only)
- Payment fields:
  - Order ID, Payment ID
  - Plan name, customer details
  - Amount, status
  - Timestamps
- Demo mode support for testing without Razorpay credentials

### Database Models
- Admin model with authentication
- Program model
- Trainer model
- Plan model
- Timetable model
- Contact model
- Payment model

### API Features
- RESTful API endpoints
- Error handling middleware
- CORS configuration
- Environment variable support
- MongoDB database integration
- Mongoose ODM

## Admin Panel Functionalities

### Authentication
- Admin login page
- JWT token storage in localStorage
- Protected routes requiring authentication
- Auto-redirect to login if not authenticated
- Session persistence

### Dashboard
- Overview statistics display:
  - Total programs count
  - Total trainers count
  - Total plans count
  - Total contact submissions
  - Total payments count
  - Total revenue calculation
- Clickable stat cards linking to respective management pages
- Real-time data fetching

### Programs Management
- View all programs in grid layout
- Create new program with form:
  - Name, description
  - Duration, difficulty
  - Image URL
  - Features (comma-separated)
  - Price
- Edit existing programs
- Delete programs with confirmation
- Modal form for create/edit operations

### Trainers Management
- View all trainers in grid layout
- Create new trainer with form
- Edit existing trainers
- Delete trainers with confirmation
- Modal form for create/edit operations

### Plans Management
- View all plans in grid layout
- Create new plan with form
- Edit existing plans
- Delete plans with confirmation
- Modal form for create/edit operations

### Timetable Management
- View all timetable entries
- Create new timetable entry with form
- Edit existing entries
- Delete entries with confirmation
- Modal form for create/edit operations

### Contacts Management
- View all contact form submissions
- View individual contact details
- Update contact status
- Display contact information:
  - Name, email, phone
  - Subject, message
  - Submission date/time
  - Status

### Payments Management
- View all payment transactions
- Display payment details:
  - Plan name
  - Customer information
  - Amount and status
  - Order ID and Payment ID
  - Date and time
- Total revenue calculation
- Status color coding (completed/pending/failed)

### Admins Management
- View all admin accounts
- Create new admin (super admin only)
- Update admin details (super admin only)
- Delete admin accounts (super admin only)
- Role-based access control

## UI/UX Features

### Design Elements
- Dark theme with neon red (#FF006E) and blue (#00F5FF) accents
- Responsive design (mobile-first approach)
- Smooth animations using Framer Motion
- Hover effects and transitions
- Gradient text effects
- Glow effects on buttons
- Card-based layouts

### User Experience
- Loading states for async operations
- Error handling and user feedback
- Form validation
- Success messages
- Confirmation dialogs for destructive actions
- Auto-refresh on window focus
- Smooth scrolling
- Page transitions

### Responsive Features
- Mobile navigation menu
- Responsive grid layouts
- Adaptive typography
- Touch-friendly buttons
- Responsive images
- Mobile-optimized forms

## Technical Features

### Frontend
- React with Vite
- React Router for navigation
- Framer Motion for animations
- Tailwind CSS for styling
- Axios for API calls
- Razorpay SDK integration

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Bcrypt for password hashing
- Razorpay payment gateway integration
- Environment-based configuration
- Error handling middleware
- CORS support

### Development Features
- Hot module replacement
- Environment variable templates
- Demo mode for payments
- Admin creation script
- Separate admin and frontend applications



