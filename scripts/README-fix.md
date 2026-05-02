# Fix Foreign Key Constraint: Availability_tutorId_fkey

## Problem
The error occurs because `Availability.tutorId` references `User.id`, but the User ID from your auth token doesn't exist in the database. This can happen if:
- User record was manually deleted
- Database was reset without re-registering
- Auth session is stale

## Step 1: Diagnostic

1. Find your user ID from the frontend console:
   ```javascript
   // In browser console on the availability page
   console.log('User ID:', window.localStorage.getItem('user') || 'check context');
   // Or add: console.log('USER:', user) in page.tsx
   ```

2. Run SQL diagnostic:
   ```bash
   cd F:/Level2/Assignment 4/BackEnd
   npx prisma migrate reset  # WARNING: This resets DB, be careful
   # OR use psql directly:
   psql "YOUR_DATABASE_URL" -f scripts/check-user-tutor.sql
   ```

## Step 2: Quick Fix (If You're in Development)

**Option A: Re-register as Tutor** (Easiest)
- Log out
- Delete your account if it exists
- Register again with role='TUTOR'
- This creates both User and Tutor records

**Option B: Run the Prisma Fix Script**
```bash
cd F:/Level2/Assignment 4/BackEnd
npx tsx scripts/prisma-fix-missing-tutors.ts
```

This will automatically create Tutor records for all TUTOR users that are missing them.

## Step 3: Test
1. Restart your backend: `npm run dev`
2. Refresh frontend, log in again
3. Try creating availability

## Step 4: If Still Failing
The User itself (not just Tutor) might be missing. Check:
```sql
SELECT * FROM "user" WHERE id = 'your-user-id';
```
If no rows returned, you need to recreate the User record or re-register.

## Files in this folder:
- `check-user-tutor.sql` - Manual SQL diagnostics
- `prisma-fix-missing-tutors.ts` - Auto-fix script (run with npx tsx)
- `fix-availability-invalid.sql` - Clean up orphaned availability records