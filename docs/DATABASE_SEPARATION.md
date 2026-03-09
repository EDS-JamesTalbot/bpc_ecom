# Database Separation Documentation

## Overview

This document details the database separation between the `loveysoap` production project and the `ecom_site_BPC` development project. Previously, both projects shared the same Neon database, causing test orders to mix with production data.

## Date of Separation
**December 6, 2025**

---

## Database Configuration

### **loveysoap (Production)**
- **Project**: Production e-commerce site for LoveySoap
- **Database**: Neon project "LoveySoap" (original production database)
- **Connection**: Uses `DATABASE_URL` from `loveysoap/.env`
- **Purpose**: Live customer orders and product data
- **Status**: ✅ Active & Clean (test data removed)

### **ecom_site_BPC (Development/Template)**
- **Project**: Development template for new e-commerce sites
- **Database**: Neon project "website_template" (newly created)
- **Connection**: Uses `DATABASE_URL` from `ecom_site_BPC/.env`
- **Purpose**: Testing, development, and template demonstrations
- **Status**: ✅ Active & Isolated (Seeded with 6 sample products)

---

## What Was Done

### 1. Created New Database for ecom_site_BPC
- Created a new Neon project named "website_template"
- Updated `ecom_site_BPC/.env` with the new `DATABASE_URL`
- Initialized the database schema using `npm run db:push`

### 2. Verified Database Isolation
- Confirmed `ecom_site_BPC` connects to its own database
- Verified all tables (products, orders, order_items) were created
- Tested connection with verification script

### 3. Cleaned Up Production Database (loveysoap)
- Identified 17 test orders mixed in with production data
- Deleted test orders and associated order items
- Verified cleanup: Reduced from 29 to 12 orders (12 real production orders remain)

### Test Orders Removed from Production:
```
Order IDs deleted: [29, 28, 27, 26, 25, 24, 23, 22, 21, 12, 11, 8, 7, 6, 5, 2, 1]
Order Items deleted: 21 items (via cascade)
```

---

## Database Schema

Both databases use the same schema structure:

### Tables
1. **products** - Product catalog with images, pricing, and availability
2. **orders** - Customer orders with shipping and payment information
3. **order_items** - Individual items in each order (linked via foreign key)

### Key Features
- Cascade deletes: Deleting an order automatically deletes its order_items
- Payment gateway support: Stripe and BPC (Bank of the Pacific) support
- Timestamps: Automatic created_at and updated_at tracking

---

## Environment Variables

### loveysoap/.env
```bash
DATABASE_URL=postgresql://[production-connection-string]
# ... other production environment variables
```

### ecom_site_BPC/.env
```bash
DATABASE_URL=postgresql://neondb_owner:npg_pxh5oZ4weqkN@ep-patient-silence-a7kw67kk-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
# ... other development environment variables
```

> ⚠️ **Important**: Never commit `.env` files to version control. These files are git-ignored.

---

## Running Database Migrations

### For loveysoap (Production)
```powershell
cd C:\Users\JamesTalbot\.cursor\loveysoap
npm run db:push
# or
npm run db:generate; npm run db:migrate
```

### For ecom_site_BPC (Development)
```powershell
cd C:\Users\JamesTalbot\.cursor\ecom_site_BPC
npm run db:push
# or
npm run db:generate; npm run db:migrate
```

---

## Verifying Database Connections

### Check which database you're connected to:

**loveysoap:**
```powershell
cd C:\Users\JamesTalbot\.cursor\loveysoap
npm run db:studio
# Opens Drizzle Studio on http://localhost:4983
# Shows production database tables and data
```

**ecom_site_BPC:**
```powershell
cd C:\Users\JamesTalbot\.cursor\ecom_site_BPC
npm run db:studio
# Opens Drizzle Studio on http://localhost:4983
# Shows template database tables and data (separate from production)
```

---

## Best Practices Going Forward

### ✅ DO:
- Always verify which project directory you're in before running database commands
- Use `ecom_site_BPC` for all testing and development
- Keep `loveysoap` for production use only
- Regularly back up the production database via Neon dashboard
- Test new features in `ecom_site_BPC` before deploying to `loveysoap`

### ❌ DON'T:
- Don't create test orders in the `loveysoap` database
- Don't copy the `loveysoap` DATABASE_URL to other projects
- Don't share database credentials
- Don't run destructive operations on production without backups

---

## Production Database Status

### Before Cleanup:
- Total orders: 29 (17 test + 12 production)
- Mixed test and real customer data
- Risk of confusion and data integrity issues

### After Cleanup:
- Total orders: 12 (all real production orders)
- Clean production data only
- Test data isolated to ecom_site_BPC database

---

## Neon Dashboard Access

### loveysoap (Production Database)
- Navigate to: https://console.neon.tech/
- Select project: "LoveySoap"
- View: Tables, backups, connection strings

### ecom_site_BPC (Development Database)
- Navigate to: https://console.neon.tech/
- Select project: "website_template"
- View: Tables, backups, connection strings

---

## Troubleshooting

### "DATABASE_URL is not set" Error
**Solution**: Ensure you're in the correct project directory and the `.env` file exists with a valid `DATABASE_URL`.

### Wrong database being accessed
**Solution**: 
1. Check current directory: `pwd` (PowerShell: `Get-Location`)
2. Verify `.env` file exists: `Get-ChildItem -Filter ".env*" -File`
3. Confirm DATABASE_URL points to the correct Neon project

### Schema mismatch errors
**Solution**: Run `npm run db:push` to sync the schema with your database.

### Need to reset ecom_site_BPC database
**Solution**: 
1. Delete all data via Neon dashboard
2. Run `npm run db:push` to recreate tables
3. Optionally seed with test data

---

## Migration Scripts (Saved for Reference)

The following scripts were used during the separation process and are saved in their respective project directories:

### loveysoap/
- `identify-test-orders-simple.ts` - Script to identify test orders in production
- `cleanup-test-orders.ts` - Script to delete test orders from production

These scripts can be modified and reused if needed for future cleanups.

---

## Summary

✅ **Completed:**
1. Created separate database for `ecom_site_BPC`
2. Initialized database schema for `ecom_site_BPC`
3. Identified 17 test orders in `loveysoap` production database
4. Cleaned up test orders and 21 associated order items
5. Verified both databases are working correctly and isolated

✅ **Result:**
- `loveysoap`: Clean production database with 12 real orders
- `ecom_site_BPC`: Isolated development database for testing
- No more data mixing between projects

---

## Contact & Support

For database-related questions or issues:
1. Check this documentation first
2. Verify your `.env` configuration
3. Check Neon dashboard for database status
4. Review the troubleshooting section above

---

**Last Updated**: December 6, 2025  
**Maintained By**: Development Team

