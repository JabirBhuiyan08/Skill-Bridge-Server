# BackEnd Scripts - SQL Diagnostic & Migration Guide

This directory contains SQL scripts to diagnose and fix foreign key constraint issues in the database, specifically related to the `Tutor` and `Availability` tables linking to the `user` table.

---

## Understanding the Foreign Key Constraint Issue

### The Problem
The `Availability.tutorId` field references `user.id` (via a foreign key). However, some `Availability` records reference `tutorId` values that either:
- Don't exist in the `user` table at all, OR
- Belong to users who don't have a corresponding `Tutor` record

Additionally, users with `role = 'TUTOR'` **must** have a corresponding record in the `Tutor` table. If a user is marked as a TUTOR but lacks a `Tutor` record, any operation that expects this relationship (like creating availabilities) will fail with a foreign key constraint violation.

### Why This Happens
- `Availability.tutorId` → `user.id` (foreign key)
- `Tutor.userId` → `user.id` (foreign key)
- Users with `role = 'TUTOR'` need a `Tutor` record to exist
- When a TUTOR user is created but the `Tutor` record isn't, the relationship chain breaks

---

## Connecting to the Database with `psql`

### 1. Basic Connection
```bash
psql -h <host> -U <username> -d <database>
```

**Common examples:**

- **Local development:**
  ```bash
  psql -h localhost -U postgres -d tutoring_db
  ```

- **With password prompt:**
  ```bash
  psql -h localhost -U postgres -d tutoring_db -W
  ```

- **Using connection string:**
  ```bash
  psql "postgresql://username:password@localhost:5432/database_name"
  ```

### 2. Check Your Connection
Once connected, verify you're in the right database:
```sql
SELECT current_database();
\dt  -- list all tables
```

---

## How to Run Each Script

### Step 1: Run Diagnostic Queries (Read-Only)
**Always start here** to understand the current state of your data.

```bash
# From within psql:
\i F:/Level2/Assignment 4/BackEnd/scripts/diagnostic-queries.sql
```

**Or run from the command line:**
```bash
psql -h localhost -U postgres -d tutoring_db -f "F:/Level2/Assignment 4/BackEnd/scripts/diagnostic-queries.sql"
```

**What this does:**
- Lists all users (last 20)
- Shows TUTOR users without corresponding `Tutor` records
- Shows `Availability` records with invalid `tutorId` references
- Provides counts of total users, tutor users, tutor records, and mismatches

---

### Step 2: Fix Missing Tutor Records (Migration)
Run this if the diagnostic shows TUTOR users without `Tutor` records.

```bash
psql -h localhost -U postgres -d tutoring_db -f "F:/Level2/Assignment 4/BackEnd/scripts/create-missing-tutors.sql"
```

**What this does:**
- Finds all users with `role = 'TUTOR'` that lack a `Tutor` record
- Creates a `Tutor` record for each (with empty bio, current timestamps)
- Shows the newly created records for verification

**No data loss** — this only adds missing records.

---

### Step 3: Fix Invalid Availability Records (Correction)
Run this if the diagnostic shows `Availability` records pointing to non-existent users.

```bash
psql -h localhost -U postgres -d tutoring_db -f "F:/Level2/Assignment 4/BackEnd/scripts/fix-availability-tutorid.sql"
```

**First**, the script shows you the problematic records. Then choose ONE option:

#### Option 1: Delete Invalid Records (Safe)
Uncomment lines 9–14 to delete orphaned availability records:
```sql
DELETE FROM "Availability"
WHERE id IN (
  SELECT a.id FROM "Availability" a
  LEFT JOIN "user" u ON a.tutorId = u.id
  WHERE u.id IS NULL
);
```

#### Option 2: Reassign to Valid Tutor (Manual)
Uncomment lines 19–21 and replace with a valid user ID:
```sql
UPDATE "Availability"
SET tutorId = 'your-valid-tutor-user-id-here'
WHERE id IN (...);
```

**Warning:** Review the affected records before running either operation.

---

## Using Prisma Studio as an Alternative

Prisma Studio is a visual database editor. It doesn't run `.sql` files directly, but you can execute raw queries:

### Method 1: Prisma Studio Raw Query
1. Open Prisma Studio:
   ```bash
   npx prisma studio
   ```
2. Navigate to your project in the browser (usually `http://localhost:5555`)
3. Click the **"Raw Query"** tab (or similar — available in Prisma Studio 5+)
4. Copy and paste the contents of `diagnostic-queries.sql` (or individual queries) into the query editor
5. Click **Run**

### Method 2: Prisma Client (Programmatic)
You can also run the SQL via a Node.js script using Prisma:
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

await prisma.$executeRaw`
  -- Paste your SQL here
  SELECT * FROM "user" WHERE role = 'TUTOR';
`;
```

**Note:** For the migration script (`create-missing-tutors.sql`), using `psql` is faster and simpler.

---

## What to Do After Running the Scripts

### 1. Verify the Fix
Run the diagnostic queries again:
```bash
psql -h localhost -U postgres -d tutoring_db -f "F:/Level2/Assignment 4/BackEnd/scripts/diagnostic-queries.sql"
```

**Expected results:**
- `tutorUsersWithoutTutorRecord` = **0**
- All `Availability` records show `status = 'OK'` (no "MISSING USER")
- `totalTutorUsers` = `totalTutorRecords`

### 2. Restart Your Application
If your app caches user/tutor data (e.g., in memory or Redis), restart it to pick up the changes:
```bash
npm run dev    # or your app's start command
```

### 3. Test Critical Workflows
- Create a new availability as a TUTOR user
- Query availabilities for a TUTOR
- Update a TUTOR's profile

### 4. Check Application Logs
Look for any remaining foreign key errors or constraint violations.

### 5. Commit the Changes (If Using Version-Controlled Migrations)
If you need to persist the fix as a formal migration, consider:
- Creating a Prisma migration: `npx prisma migrate dev`
- Or saving these scripts to a `migrations/` folder with timestamps

---

## Quick Reference - Verification Commands

### Check Foreign Key Integrity
```sql
-- Find orphaned Availability records
SELECT a.* FROM "Availability" a
LEFT JOIN "user" u ON a.tutorId = u.id
WHERE u.id IS NULL;

-- Find TUTOR users without Tutor record
SELECT u.* FROM "user" u
LEFT JOIN "Tutor" t ON u.id = t.userId
WHERE u.role = 'TUTOR' AND t.id IS NULL;
```

### Count Summary
```sql
SELECT
  (SELECT COUNT(*) FROM "user") as total_users,
  (SELECT COUNT(*) FROM "user" WHERE role = 'TUTOR') as tutor_users,
  (SELECT COUNT(*) FROM "Tutor") as tutor_records,
  (SELECT COUNT(*) FROM "Availability") as availabilities,
  (SELECT COUNT(*) FROM "Availability" a LEFT JOIN "user" u ON a.tutorId = u.id WHERE u.id IS NULL) as orphaned_availabilities;
```

---

## Need Help?

- **Database connection issues?** Check your `.env` file for `DATABASE_URL`
- **Still seeing foreign key errors?** Re-run diagnostics and confirm all counts match
- **Data looks wrong?** Restore from backup and re-run scripts carefully

*Last updated: May 2026*