# FleetOps Full-Stack Application - Complete Implementation Guide

## 🎉 Project Overview

This is a complete production-ready Vehicle & Service Operations Management System built with:

**Frontend:** React 18 + Vite + React Router
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Authentication:** JWT (JSON Web Tokens)
**Password Security:** bcryptjs

---

## 📁 Project Structure

### Backend Architecture

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Auth endpoints (login, register, profile)
│   ├── itemController.js     # Item management
│   └── orderController.js    # Order operations
├── middleware/
│   ├── authMiddleware.js     # JWT verification
│   ├── errorMiddleware.js    # Error handling
│   ├── roleMiddleware.js     # Role-based access
│   └── validationMiddleware.js # Input validation
├── models/
│   ├── User.js              # User schema (ADMIN, VENDOR, USER)
│   ├── Vendor.js            # Vendor profile
│   ├── Item.js              # Service items
│   └── Order.js             # Orders
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   ├── itemRoutes.js        # Item routes
│   └── orderRoutes.js       # Order routes
├── services/
│   ├── itemService.js       # Business logic for items
│   └── orderService.js      # Business logic for orders
├── utils/
│   ├── generateToken.js     # JWT token generation
│   ├── seedAdmin.js         # Admin seeding
│   └── verifyAdmin.js       # Admin verification helper
├── app.js                   # Express app setup
└── server.js                # Server entry point
```

### Frontend Architecture

```
frontend/src/
├── api/
│   └── api.js              # Axios instance with interceptors
├── components/
│   ├── Navbar.jsx          # Navigation (responsive)
│   ├── ProtectedRoute.jsx  # Route protection
│   ├── Alert.jsx           # Alert notifications
├── context/
│   └── AuthContext.jsx     # Authentication state management
├── pages/
│   ├── Login.jsx           # Login page
│   ├── Register.jsx        # Registration page
│   ├── ItemListingNew.jsx  # Browse items with search/filter
│   ├── UserDashboardNew.jsx # User orders management
│   ├── VendorDashboard.jsx # Vendor item & order management
│   └── AdminDashboard.jsx  # Admin panel
├── styles/
│   └── main.css           # Complete styling system
├── App.jsx                # Main application
└── index.js               # React entry point
```

---

## ✨ Key Features Implemented

### Authentication & Authorization
- ✅ User registration (USER, VENDOR roles)
- ✅ Login with JWT token
- ✅ Admin auto-seeding on startup
- ✅ Role-based access control (RBAC)
- ✅ Protected routes
- ✅ User profile management

### Item Management
- ✅ Create/Update/Delete items (vendors only)
- ✅ Category-based organization (MAINTENANCE, REPAIR, SERVICE, OTHER)
- ✅ Stock management
- ✅ Search by name/description
- ✅ Real-time availability status
- ✅ Pagination & filtering

### Order System
- ✅ Users can place orders
- ✅ Order status tracking (CREATED, ACCEPTED, IN_PROGRESS, COMPLETED, REJECTED, CANCELLED)
- ✅ Vendors can manage order status
- ✅ Users can cancel orders
- ✅ Order statistics (admin)
- ✅ Automatic total amount calculation

### User Dashboards
- ✅ **User Dashboard:** View/cancel orders, order history
- ✅ **Vendor Dashboard:** Manage items, view/update orders
- ✅ **Admin Dashboard:** View all users & vendors, approve vendors

### Data Validation
- ✅ Input validation middleware
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ Phone number validation
- ✅ Quantity validation
- ✅ Pagination limits

### UI/UX
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Modal dialogs for operations
- ✅ Alert notifications
- ✅ Loading states
- ✅ Error handling
- ✅ Clean, professional styling
- ✅ Lucide icons integration

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

1. **Update MongoDB URI in `.env`:**

   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.vtoriqb.mongodb.net/fleetops?retryWrites=true&w=majority
   JWT_SECRET=your_secret_key_here_change_this
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

   You should see:
   ```
   MongoDB Connected
   Admin user seeded successfully
   Server running in development mode on port 5000
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Update API endpoint in `src/api/api.js`** (if needed):
   ```javascript
   const api = axios.create({
       baseURL: 'http://localhost:5000/api'
   });
   ```

3. **Start the frontend:**
   ```bash
   npm start
   # or with Vite:
   npm run dev
   ```

   Frontend will be available at `http://localhost:3000` (Create React App) or `http://localhost:5173` (Vite)

---

## 🔐 Default Admin Account

After seeding, use these credentials to log in as admin:

```
Email: fleetops@gmail.com
Password: admin123
```

---

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register           # Register new user
POST   /api/auth/login              # Login
GET    /api/auth/profile            # Get current user
PUT    /api/auth/profile            # Update profile
GET    /api/auth/users              # Get all users (admin)
GET    /api/auth/vendors            # Get all vendors (admin)
PUT    /api/auth/vendors/:id/approve # Approve vendor (admin)
```

### Items

```
GET    /api/items                   # Get all items (with pagination)
GET    /api/items/featured          # Get featured items
GET    /api/items/search/:query     # Search items
GET    /api/items/category/:cat     # Get by category
GET    /api/items/:id               # Get single item
POST   /api/items                   # Create item (vendor)
PUT    /api/items/:id               # Update item (vendor)
DELETE /api/items/:id               # Delete item (vendor)
GET    /api/items/vendor/my-items   # Get vendor's items
```

### Orders

```
GET    /api/orders                  # Get all orders (admin)
GET    /api/orders/stats/overview   # Order statistics (admin)
POST   /api/orders                  # Create order (user)
GET    /api/orders/:id              # Get order details
GET    /api/orders/user/my-orders   # Get user's orders
GET    /api/orders/vendor/my-orders # Get vendor's orders
PUT    /api/orders/:id/status       # Update status (vendor)
PUT    /api/orders/:id/cancel       # Cancel order (user)
```

---

## 🧪 Testing the Application

### 1. Register as a New User

```bash
POST http://localhost:5000/api/auth/register
Body: {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "USER",
    "phone": "1234567890"
}
```

### 2. Register as a Vendor

```bash
POST http://localhost:5000/api/auth/register
Body: {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123",
    "role": "VENDOR",
    "companyName": "Smith Services",
    "phone": "9876543210"
}
```

### 3. Login

```bash
POST http://localhost:5000/api/auth/login
Body: {
    "email": "john@example.com",
    "password": "password123"
}
Response: { token: "jwt_token_here", role: "USER", ... }
```

### 4. Use Token in Requests

```bash
GET http://localhost:5000/api/auth/profile
Headers: {
    "Authorization": "Bearer jwt_token_here"
}
```

---

## 🛠️ Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/fleetops?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_secret_key_min_32_characters_recommended

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

---

## 🎯 Role Permissions

### ADMIN
- ✅ View all users
- ✅ View all vendors
- ✅ Approve vendors
- ✅ Deactivate users
- ✅ View order statistics
- ✅ Access admin dashboard

### VENDOR
- ✅ Create/update/delete items
- ✅ View own items
- ✅ View orders for their items
- ✅ Update order status
- ✅ View vendor dashboard

### USER
- ✅ View all items
- ✅ Search items
- ✅ Create orders
- ✅ View own orders
- ✅ Cancel orders
- ✅ View user dashboard

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

1. Check `MONGO_URI` in `.env`
2. Verify credentials are correct
3. Add IP whitelist in MongoDB Atlas (0.0.0.0/0 for development)
4. Check internet connection

### Admin Not Seeding

1. Restart the backend server
2. Check console for "Admin user seeded successfully"
3. Run helper script: `node backend/utils/verifyAdmin.js`

### Registration/Login Errors

1. Check Network tab in browser developer tools
2. Verify backend is running on port 5000
3. Check API endpoint in frontend `src/api/api.js`

### Token Expired

- Token expires after 30 days
- User must log in again
- Implement token refresh (future enhancement)

---

## 📊 Database Schema Reference

### User
- `_id`: ObjectId
- `name`: String (required)
- `email`: String (unique, required)
- `password`: String (hashed, required)
- `phone`: String
- `role`: Enum: ADMIN, VENDOR, USER
- `isActive`: Boolean (default: true)
- `lastLogin`: Date

### Vendor
- `_id`: ObjectId
- `user`: ObjectId (ref: User)
- `companyName`: String (required)
- `description`: String
- `phone`: String
- `address`: String
- `approved`: Boolean (default: false)
- `rating`: Number (0-5)
- `totalOrders`: Number

### Item
- `_id`: ObjectId
- `vendor`: ObjectId (ref: Vendor)
- `name`: String (required)
- `description`: String (required)
- `price`: Number (required)
- `category`: Enum: MAINTENANCE, REPAIR, SERVICE, OTHER
- `available`: Boolean
- `stock`: Number
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Order
- `_id`: ObjectId
- `user`: ObjectId (ref: User)
- `vendor`: ObjectId (ref: Vendor)
- `item`: ObjectId (ref: Item)
- `quantity`: Number
- `totalAmount`: Number
- `status`: Enum: CREATED, ACCEPTED, REJECTED, IN_PROGRESS, COMPLETED, CANCELLED
- `createdAt`: DateTime
- `updatedAt`: DateTime

---

## 🚀 Deployment Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Set NODE_ENV=production
- [ ] Use production MongoDB URI
- [ ] Enable database backup
- [ ] Set up SSL certificates
- [ ] Configure CORS for production domain
- [ ] Add rate limiting
- [ ] Set up error logging (Sentry, Loggly, etc.)
- [ ] Configure email service
- [ ] Set up automated backups
- [ ] Test all endpoints with real data

---

## 📚 Additional Enhancements (Future)

- [ ] Email notifications for order status
- [ ] Payment gateway integration
- [ ] File upload for item images
- [ ] Review & rating system
- [ ] Vendor approval workflow
- [ ] Analytics dashboard
- [ ] Export to CSV/PDF
- [ ] Websocket for real-time updates
- [ ] Two-factor authentication
- [ ] API documentation (Swagger)
- [ ] Unit & integration tests
- [ ] CI/CD pipeline
- [ ] Docker containerization

---

## 📞 Support

For issues:
1. Check console logs
2. Review API response status codes & messages
3. Verify environment variables
4. Test with Postman
5. Check GitHub issues

---

## 📝 License

This project is open source and available under the MIT License.

