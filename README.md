# EpidemiQc - Quebec Epidemic Detection & Alert Platform

A comprehensive web-based platform for monitoring and alerting epidemics across Quebec's population. Built with React, TypeScript, Node.js, Express, and PostgreSQL.

## Features

### Public Features
- **Interactive Map**: Visualize outbreak hotspots across Quebec regions using Google Maps
- **Real-time Data**: Track positive test rates and outbreak trends
- **Bilingual Support**: Full French and English interface
- **Quebec Government Branding**: Professional styling aligned with government standards

### User Features (Authenticated)
- **User Registration & Authentication**: Secure account creation and login
- **Personal Dashboard**: View outbreaks relevant to your preferences
- **Custom Notifications**: Set preferences by region, condition, and severity
- **Outbreak Tracking**: Monitor trends over time

### Admin Features
- **Analytics Dashboard**: View system-wide statistics
- **Data Management**: Add and manage test results
- **Threshold Configuration**: Set outbreak severity thresholds
- **User Management**: Overview of user activity

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Zustand** - State management
- **React i18next** - Internationalization
- **Google Maps API** - Interactive maps
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** with TypeScript
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting

## Prerequisites

- **Node.js** 18+ and npm/pnpm
- **PostgreSQL** 14+
- **Google Maps API Key** (for map functionality)

## Installation & Setup

### 1. Clone the Repository

```bash
cd EpidemiQc
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your PostgreSQL credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=epidemiqc
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key
# PORT=5000

# Create PostgreSQL database
psql -U postgres
CREATE DATABASE epidemiqc;
\q

# Run database schema and seed data
npm run seed

# Start backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your API keys
# VITE_API_BASE_URL=http://localhost:5000/api/v1
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Start frontend development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Getting a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the **Maps JavaScript API**
4. Create credentials (API Key)
5. Restrict the API key to your domain (optional but recommended)
6. Add the API key to `frontend/.env.local`

## Demo Accounts

After running `npm run seed`, the following demo accounts are available:

**Admin Account:**
- Email: `admin@epidemiqc.ca`
- Password: `admin123`

**Regular User Account:**
- Email: `user@epidemiqc.ca`
- Password: `user123`

## Project Structure

```
EpidemiQc/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & validation
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (future)
│   │   ├── types/          # TypeScript types
│   │   ├── database/       # Schema & seed files
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   ├── i18n/           # Translations (FR/EN)
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (protected)

### Regions
- `GET /api/v1/regions` - Get all regions
- `GET /api/v1/regions/:id` - Get region by ID
- `GET /api/v1/regions/:id/trends` - Get region trends

### Conditions
- `GET /api/v1/conditions` - Get all conditions
- `GET /api/v1/conditions/:id` - Get condition by ID

### Outbreaks
- `GET /api/v1/outbreaks/current` - Get current outbreaks
- `GET /api/v1/outbreaks/map-data` - Get map data with regions

### Preferences (Protected)
- `GET /api/v1/preferences` - Get user preferences
- `POST /api/v1/preferences` - Create preference
- `PUT /api/v1/preferences/:id` - Update preference
- `DELETE /api/v1/preferences/:id` - Delete preference

### Admin (Protected - Admin Only)
- `GET /api/v1/admin/test-results` - Get test results
- `POST /api/v1/admin/test-results` - Add test result
- `GET /api/v1/admin/analytics/overview` - Get analytics
- `GET /api/v1/admin/thresholds` - Get thresholds
- `PUT /api/v1/admin/thresholds/:id` - Update threshold

## Database Schema

The database includes the following main tables:
- **users** - User accounts and authentication
- **regions** - Quebec administrative health regions (17 regions)
- **conditions** - Health conditions being monitored (Flu, COVID, Strep A, RSV, etc.)
- **test_results** - Mock lab test data
- **thresholds** - Outbreak severity thresholds
- **user_preferences** - User notification preferences
- **notifications** - Notification history
- **audit_logs** - Admin action logs

## Mock Data

The seed script generates:
- 17 Quebec regions with realistic population data
- 6 health conditions (Influenza, COVID-19, Strep A, RSV, Norovirus, E. coli)
- 90 days of mock test results for each region/condition combination
- Outbreak thresholds (Warning: 5%, Alert: 10%, Critical: 20%)
- 2 demo user accounts

## Development

### Backend Development

```bash
cd backend
npm run dev  # Start with auto-reload
```

### Frontend Development

```bash
cd frontend
npm run dev  # Start Vite dev server
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build    # Compile TypeScript
npm start        # Run compiled code
```

**Frontend:**
```bash
cd frontend
npm run build    # Build for production
npm run preview  # Preview production build
```

## Features Implemented

✅ User authentication (JWT)
✅ Interactive Google Maps with outbreak markers
✅ Color-coded severity indicators
✅ Dashboard with outbreak statistics
✅ User preference management
✅ Admin panel with analytics
✅ Data management (add/view test results)
✅ French/English language toggle
✅ Quebec government branding
✅ Responsive design
✅ Real-time outbreak detection
✅ Mock data generation

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet security headers
- CORS configuration
- SQL injection prevention (parameterized queries)
- Admin role-based access control

## Future Enhancements

- Email notifications (Nodemailer/SendGrid)
- Push notifications (Firebase Cloud Messaging)
- CSV file upload for bulk data import
- PDF report generation
- Advanced analytics and charts
- SMS alerts (Twilio)
- Real-time updates (WebSockets)
- Mobile app (React Native)

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check database credentials in `backend/.env`
- Verify database exists: `psql -U postgres -l`

### Google Maps Not Loading
- Verify API key is correct in `frontend/.env.local`
- Check that Maps JavaScript API is enabled in Google Cloud Console
- Ensure billing is enabled for your Google Cloud project

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.ts`

## License

This is an academic project for demonstration purposes.

## Contact

For questions or issues, please contact the project maintainer.

---

**Built with ❤️ for Quebec**
