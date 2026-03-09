# EstateBANK.in Admin Dashboard

A modern Real Estate CRM Admin Dashboard built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🏠 **Property Management** - Manage all properties, types, amenities, and more
- 👥 **CRM** - Lead management, follow-ups, activity logs, and WhatsApp integration
- 🌍 **Locations** - Manage locations, areas, and working days
- 👨‍💼 **People** - Manage clients, flat owners, brokers, and team members
- 📰 **Website Management** - Manage banners, pages, services, and SEO
- 📦 **Content Management** - Blogs and testimonials
- 📞 **Communication** - Enquiries, contacts, and WhatsApp broadcast
- ⚙️ **Settings** - Comprehensive settings management

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query) + Zustand
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Setup Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Set up MongoDB:**

   **Option A: MongoDB Atlas (Cloud - Recommended)**
   - Follow the guide in [MONGODB_SETUP.md](./MONGODB_SETUP.md)
   - Get your connection string from MongoDB Atlas
   - Update `.env.local` with your Atlas connection string

   **Option B: Local MongoDB**
   - Install MongoDB locally (see [MONGODB_SETUP.md](./MONGODB_SETUP.md))
   - Run the setup script:
     ```bash
     ./scripts/setup-mongodb.sh
     ```
   - Or manually start MongoDB:
     ```bash
     brew services start mongodb-community  # macOS
     ```

3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env.local` (if not exists)
   - Update `MONGODB_URI` in `.env.local`:
     ```
     MONGODB_URI=mongodb://localhost:27017/estatebank  # Local
     # OR
     MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/estatebank  # Atlas
     ```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Project Structure

```
frontend/
├── app/
│   ├── (dashboard)/          # Dashboard routes
│   │   ├── dashboard/         # Dashboard overview
│   │   ├── properties/        # Property management
│   │   ├── locations/         # Location management
│   │   ├── crm/               # CRM features
│   │   ├── people/            # People management
│   │   ├── website/           # Website management
│   │   ├── content/           # Content management
│   │   ├── communication/     # Communication features
│   │   └── settings/          # Settings
│   ├── globals.css            # Global styles
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # shadcn/ui components
│   └── providers.tsx          # React Query provider
└── lib/
    └── utils.ts               # Utility functions
```

## API Routes

All API routes are available under `/api/`:

- **Properties**: `/api/properties`
- **CRM**: `/api/leads`, `/api/follow-ups`, `/api/activities`
- **People**: `/api/people/clients`, `/api/people/owners`, `/api/people/brokers`, `/api/people/team`
- **Locations**: `/api/locations`, `/api/areas`, `/api/working-days`
- **Content**: `/api/testimonials`, `/api/clients`, `/api/services`, `/api/amenities`
- **Website**: `/api/hero-images`, `/api/homepage-areas`, `/api/branding`
- **Communication**: `/api/enquiries`

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed MongoDB setup instructions.

## Next Steps

- ✅ MongoDB setup and API routes created
- Set up authentication (Clerk/NextAuth)
- Update frontend to use API routes instead of DataStore
- Implement data tables with TanStack Table
- Add charts and analytics
- Set up file uploads (S3/Cloudinary)

mgT0heW3XFAm15J6b53TSD