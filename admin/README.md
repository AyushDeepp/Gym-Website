# Admin Panel - Elite Gym

Admin panel for managing the Elite Gym website.

## Setup

1. **Install Dependencies**
   ```bash
   cd admin
   npm install
   ```

2. **Create Environment File**
   Create a `.env` file in the `admin` folder:
   ```env
   VITE_API_URL=http://localhost:9000/api
   ```

3. **Run Admin Panel**
   ```bash
   npm run dev
   ```

4. **Access Admin Panel**
   - URL: http://localhost:5174
   - Default credentials:
     - Email: admin@elitegym.com
     - Password: admin123

## Create Default Admin

Before logging in, create the default admin:

```bash
cd backend
npm run create-admin
```

This will create a superadmin with:
- Email: admin@elitegym.com
- Password: admin123

**⚠️ Important:** Change the password after first login!

## Features

- **Dashboard**: Overview of all statistics
- **Programs Management**: CRUD operations for fitness programs
- **Trainers Management**: CRUD operations for trainers
- **Plans Management**: CRUD operations for membership plans
- **Timetable Management**: CRUD operations for class schedule
- **Contacts**: View and manage contact form submissions
- **Payments**: View all payment transactions and revenue
- **Admin Management**: Add new admins (only existing admins can add new ones)

## Security

- JWT-based authentication
- Protected routes (requires login)
- Only authenticated admins can perform CRUD operations
- Only existing admins can create new admin accounts (no public sign-up)

