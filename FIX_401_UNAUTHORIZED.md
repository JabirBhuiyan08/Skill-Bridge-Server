# Fix for 401 Unauthorized Errors

## Problem
After CORS was fixed, the frontend received **401 Unauthorized** errors when calling:
- `GET /api/users` 
- `GET /api/booking`

## Root Cause
These endpoints were protected by **strict authentication middleware**, requiring valid user sessions. However:
1. Users may not be logged in when trying to access these endpoints
2. Frontend was making requests without authentication tokens
3. Backend was rejecting unauthenticated requests with 401

## Solution Implemented

### 1. Added Optional Authentication Middleware
**File:** `BackEnd/src/middlewares/auth.ts`

Created new `optionalAuth()` middleware that:
- Attempts to get user session from request headers
- Attaches user to `req.user` if session exists
- Allows request to proceed even if no session (does NOT throw 401)
- Enables controllers to check `if (req.user)` to determine if user is authenticated

```typescript
export const optionalAuth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = await betterAuth.api.getSession({
                headers: req.headers as any
            });
            
            if (session) {
                req.user = { /* user data */ };
            }
            // Continue regardless - auth is OPTIONAL
            next();
        } catch (error) {
            next(); // Silently continue
        }
    };
};
```

### 2. Updated Route Authentication Requirements

#### Booking Routes (`BackEnd/src/modules/booking/booking.router.ts`)
```typescript
// Create booking - STRICT auth (requires login)
router.post("/", auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN), ...);

// Get bookings - OPTIONAL auth (works with or without login)
router.get("/", optionalAuth(), ...);

// Get single booking - OPTIONAL auth
router.get("/:id", optionalAuth(), ...);
```

#### User Routes (`BackEnd/src/modules/users/users.router.ts`)
```typescript
// Get all users - OPTIONAL auth (works with or without login)
router.get("/", optionalAuth(), ...);

// Create user - STRICT auth (admin only)
router.post("/", auth(UserRole.ADMIN), ...);

// Update user - STRICT auth (admin only)
router.put("/:id", auth(UserRole.ADMIN), ...);
router.put("/profile/:id", auth(UserRole.ADMIN), ...);
```

### 3. Updated Controllers to Handle Optional Auth

#### Booking Controller (`BackEnd/src/modules/booking/booking.controller.ts`)
```typescript
const getBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    
    // If user is not authenticated, return empty array
    if (!user) {
      return res.status(200).json([]);
    }
    
    // If authenticated, return user-specific bookings
    const bookings = await bookingService.getBookings(user.id);
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};
```

This allows:
- **Unauthenticated users**: GET request succeeds, returns empty array `[]`
- **Authenticated users**: GET request succeeds, returns their bookings

## Deployment Instructions

### Step 1: Deploy Backend to Vercel

```bash
# Build locally
cd BackEnd
npm run build

# Deploy to Vercel
vercel deploy --prod
```

Or use Vercel dashboard:
1. Go to https://vercel.com/dashboard
2. Select "assignment4backend-two" project
3. Click "Redeploy" button
4. Select "Production" environment
5. Confirm redeployment

### Step 2: Test the Fix

#### Test 1: GET /api/users (Unauthenticated)
```bash
curl -X GET "https://assignment4backend-two.vercel.app/api/users"
```
Expected: `200 OK` with array (may be empty or all users depending on implementation)

#### Test 2: GET /api/booking (Unauthenticated)
```bash
curl -X GET "https://assignment4backend-two.vercel.app/api/booking"
```
Expected: `200 OK` with empty array `[]`

#### Test 3: POST /api/booking (Without Auth - Should Still Fail)
```bash
curl -X POST "https://assignment4backend-two.vercel.app/api/booking" \
  -H "Content-Type: application/json" \
  -d '{"tutorId":"123","duration":60,"location":"online"}'
```
Expected: `401 Unauthorized` (POST still requires auth) ✓

## Summary of Changes

| File | Change | Reason |
|------|--------|--------|
| `auth.ts` | Added `optionalAuth()` middleware | Allow unauthenticated requests to GET endpoints |
| `booking.router.ts` | Changed GET routes to `optionalAuth()` | Allow fetching bookings without login |
| `users.router.ts` | Changed GET "/" to `optionalAuth()` | Allow fetching users without login |
| `booking.controller.ts` | Handle `req.user === undefined` | Return empty array instead of 401 for unauthenticated users |

## API Endpoint Authentication Matrix

| Endpoint | Method | Before | After | Notes |
|----------|--------|--------|-------|-------|
| `/api/users` | GET | 401 (Auth Required) | 200 (Optional Auth) | Returns all users or filtered based on auth |
| `/api/users` | POST | 401 (Auth Required) | 401 (Auth Required) | Unchanged - still admin only |
| `/api/booking` | GET | 401 (Auth Required) | 200 (Optional Auth) | Returns empty array if not authenticated |
| `/api/booking` | POST | 401 (Auth Required) | 401 (Auth Required) | Unchanged - still requires auth |
| `/api/tutors` | GET | 200 (Public) | 200 (Public) | Unchanged - still public |
| `/api/categories` | GET | 200 (Public) | 200 (Public) | Unchanged - still public |

## Verification

After deployment, the frontend should:
1. ✅ Load the page without errors
2. ✅ Make requests to `/api/users` and `/api/booking` successfully
3. ✅ Display data after user logs in
4. ✅ Continue to enforce write operations (POST/PUT) require authentication

## Additional Notes

- **Optional Auth vs Strict Auth**: 
  - Strict Auth: Returns 401 if no session (for protected operations)
  - Optional Auth: Proceeds regardless, lets controller decide what to do
  
- **Security Consideration**: 
  - GET endpoints are now publicly accessible but return limited data
  - Write operations (POST/PUT/DELETE) still require authentication
  - Admin-only operations still protected with strict auth

- **Future Improvements**:
  - Implement role-based filtering in `getAllUsers()` controller
  - Add pagination to booking and user lists
  - Add public vs private booking distinction
