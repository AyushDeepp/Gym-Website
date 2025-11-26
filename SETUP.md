# 🚀 Quick Setup Guide

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Configure Environment Variables

### Backend
1. Create a `.env` file in the `backend` folder (or copy from `.env.example` if it exists)
2. Add the following:
   ```env
   PORT=9000
   MONGODB_URI=mongodb://localhost:27017/gym-website
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   NODE_ENV=development
   DEMO_MODE=true
   ```
3. Update:
   - `MONGODB_URI` - Your MongoDB connection string
   - `DEMO_MODE=true` - Keep this for demo mode (no Razorpay needed)

### Frontend
1. Create a `.env` file in the `frontend` folder (or copy from `.env.example` if it exists)
2. Add the following:
   ```env
   VITE_API_URL=http://localhost:9000/api
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   VITE_DEMO_MODE=true
   ```
3. Update:
   - `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)
   - `VITE_DEMO_MODE=true` - Keep this for demo mode

## Step 3: Start MongoDB

Make sure MongoDB is running on your system or use MongoDB Atlas.

## Step 4: Run the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

## Step 5: Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:9000

## 📝 Adding Sample Data

You can add sample data using MongoDB Compass, MongoDB Atlas, or by creating a seed script. Here's an example for adding a plan:

```javascript
// Example: Add a membership plan
{
  "name": "Basic Plan",
  "price": 999,
  "duration": "month",
  "features": [
    "Access to all equipment",
    "Group fitness classes",
    "Locker room",
    "Free parking"
  ],
  "popular": false
}
```

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check your connection string
- Verify network access if using MongoDB Atlas

### Razorpay Issues
- **Demo Mode**: The app works in demo mode by default. No Razorpay credentials needed!
- For real payments: Verify your Razorpay credentials
- Ensure you're using test keys for development
- Check Razorpay dashboard for order status
- To switch to demo mode: Set `DEMO_MODE=true` in backend and `VITE_DEMO_MODE=true` in frontend

### CORS Issues
- Backend CORS is configured to allow all origins in development
- For production, update CORS settings in `backend/server.js`

## 🎨 Customization

### Colors
Edit `frontend/tailwind.config.js` to change the color scheme:
- `primary.red`: Main red accent color
- `primary.blue`: Main blue accent color
- `primary.dark`: Background colors

### Content
- Update images in Gallery page
- Modify testimonials in Testimonials page
- Edit contact information in Footer and Contact page

## 📦 Production Build

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm start
```

Make sure to set `NODE_ENV=production` in your production environment variables.

