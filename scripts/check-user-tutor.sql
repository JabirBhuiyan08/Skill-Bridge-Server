-- Check if your authenticated user has a corresponding Tutor record
-- Replace 'YOUR-USER-ID-HERE' with the actual user ID from your token

-- 1. Check the user record
SELECT id, name, email, role, createdAt 
FROM "user" 
WHERE id = 'YOUR-USER-ID-HERE';

-- 2. Check if Tutor record exists for this user
SELECT t.id as tutorId, t.userId, t.name, t.email, t.bio
FROM "Tutor" t
WHERE t.userId = 'YOUR-USER-ID-HERE';

-- 3. Check all TUTOR users without Tutor records
SELECT u.id, u.name, u.email, u.role, u.createdAt
FROM "user" u
LEFT JOIN "Tutor" t ON u.id = t.userId
WHERE u.role = 'TUTOR' AND t.id IS NULL
ORDER BY u.createdAt DESC;