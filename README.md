# DropShip Pro - Dropshipping Platform

A fully functional dropshipping platform built with Next.js, TypeScript, Prisma, and Stripe. This platform allows distributors to list products and buyers to purchase them, with integrated payment processing and platform fee management.

## Features

### For Distributors
- ✅ User registration and authentication
- ✅ Product management (Create, Read, Update, Delete)
- ✅ Product activation/deactivation
- ✅ Inventory management
- ✅ View orders for your products
- ✅ Track sales and revenue

### For Buyers
- ✅ User registration and authentication
- ✅ Browse product catalog
- ✅ Shopping cart functionality
- ✅ Secure checkout with Stripe
- ✅ Order tracking
- ✅ Order history

### Platform Features
- ✅ Role-based access control (Buyer, Distributor, Admin)
- ✅ Platform fee calculation (configurable percentage)
- ✅ Stripe payment integration
- ✅ Order management system
- ✅ Payment tracking and records
- ✅ Admin dashboard for platform overview
- ✅ Real-time stock management
- ✅ Secure authentication with NextAuth.js

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite (via Prisma) - easily switchable to PostgreSQL/MySQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Payment Processing**: Stripe
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Tailwind

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Stripe account (for payment processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dropshipping-site
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-change-in-production-make-it-long-and-random"
   NEXTAUTH_URL="http://localhost:3000"
   STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
   STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
   PLATFORM_FEE_PERCENTAGE="5"
   ```

   **Important**: 
   - Generate a secure random string for `NEXTAUTH_SECRET` (you can use `openssl rand -base64 32`)
   - Get your Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - Set up a webhook endpoint in Stripe pointing to `https://yourdomain.com/api/webhooks/stripe` and use the webhook secret

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Creating an Admin User

To create an admin user, you can use Prisma Studio or directly modify the database:

```bash
npx prisma studio
```

Then manually update a user's role to `ADMIN` in the database, or create a script to do this programmatically.

## Project Structure

```
dropshipping-site/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── products/      # Product CRUD endpoints
│   │   │   ├── cart/          # Cart endpoints
│   │   │   ├── checkout/      # Checkout & Stripe integration
│   │   │   ├── orders/        # Order management
│   │   │   └── webhooks/      # Stripe webhooks
│   │   ├── auth/              # Authentication pages
│   │   ├── products/          # Product catalog pages
│   │   ├── cart/              # Shopping cart page
│   │   ├── checkout/          # Checkout page
│   │   ├── orders/            # Order pages
│   │   └── dashboard/         # User dashboards
│   ├── components/            # Reusable components
│   └── lib/                   # Utility functions
│       ├── prisma.ts          # Prisma client
│       └── auth.ts            # NextAuth configuration
└── public/                    # Static assets
```

## Key Features Explained

### Platform Fees
The platform automatically calculates and collects a fee (default 5%) on each transaction. This fee is:
- Calculated during checkout
- Displayed to buyers
- Tracked in the database
- Visible in the admin dashboard

### Order Flow
1. Buyer adds products to cart
2. Buyer proceeds to checkout
3. Shipping information is collected
4. Stripe Checkout session is created
5. Buyer completes payment on Stripe
6. Webhook updates order status and reduces stock
7. Payment and platform fee records are created
8. Distributor can see the order in their dashboard

### Stock Management
- Stock is automatically decremented when an order is completed
- Products with 0 stock cannot be added to cart
- Distributors can update stock levels

## Stripe Setup

1. **Create a Stripe account** at [stripe.com](https://stripe.com)

2. **Get your API keys** from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

3. **Set up webhooks**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`
   - Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

4. **For local development**, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   This will give you a webhook secret to use locally.

## Database Migrations

When you make changes to the Prisma schema:

```bash
npx prisma migrate dev --name your_migration_name
```

To view your database:

```bash
npx prisma studio
```

## Production Deployment

1. **Switch to PostgreSQL** (recommended for production):
   - Update `DATABASE_URL` in `.env` to your PostgreSQL connection string
   - Update `provider` in `prisma/schema.prisma` to `postgresql`
   - Run migrations

2. **Set up environment variables** on your hosting platform

3. **Configure Stripe webhooks** to point to your production URL

4. **Build and deploy**:
   ```bash
   npm run build
   npm start
   ```

## Security Considerations

- ✅ Passwords are hashed using bcrypt
- ✅ Authentication required for protected routes
- ✅ Role-based access control
- ✅ Input validation with Zod
- ✅ SQL injection protection via Prisma
- ⚠️ Update `NEXTAUTH_SECRET` in production
- ⚠️ Use HTTPS in production
- ⚠️ Set up proper CORS policies
- ⚠️ Implement rate limiting for API routes
- ⚠️ Add CSRF protection

## Future Enhancements

- [ ] Email notifications for orders
- [ ] Product reviews and ratings
- [ ] Advanced search and filtering
- [ ] Product categories and tags
- [ ] Inventory alerts
- [ ] Analytics dashboard
- [ ] Multi-currency support
- [ ] Shipping integration
- [ ] Refund management
- [ ] Dispute resolution system

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on the repository.
