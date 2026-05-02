-- Diagnostic Queries for Foreign Key Constraint Issue
-- Run these queries in your PostgreSQL database to identify the problem

-- 1. Check all User IDs (especially the one you're trying to use)
SELECT id, name, email, role, createdAt FROM "user" ORDER BY createdAt DESC LIMIT 20;

-- 2. Check if the specific user exists (replace 'YOUR-USER-ID-HERE' with actual ID)
SELECT id, name, email, role FROM "user" WHERE id = 'YOUR-USER-ID-HERE';

-- 3. Check all Tutor records and their linked userId
SELECT t.id as tutorId, t.userId, t.name, t.email, u.id as userExists 
FROM "Tutor" t 
LEFT JOIN "user" u ON t.userId = u.id 
ORDER BY t.createdAt DESC LIMIT 20;

-- 4. Check for Users with role=TUTOR that DON'T have a Tutor record
SELECT u.id, u.name, u.email, u.role 
FROM "user" u 
LEFT JOIN "Tutor" t ON u.id = t.userId 
WHERE u.role = 'TUTOR' AND t.id IS NULL;

-- 5. Check all existing Availabilities and their tutorId references
SELECT a.id, a.tutorId, u.name as tutorName, u.email as tutorEmail,
       CASE WHEN u.id IS NULL THEN 'MISSING USER' ELSE 'OK' END as status
FROM "Availability" a
LEFT JOIN "user" u ON a.tutorId = u.id
ORDER BY a.createdAt DESC LIMIT 20;

-- 6. Count check
SELECT 
  (SELECT COUNT(*) FROM "user") as totalUsers,
  (SELECT COUNT(*) FROM "user" WHERE role = 'TUTOR') as totalTutorUsers,
  (SELECT COUNT(*) FROM "Tutor") as totalTutorRecords,
  (SELECT COUNT(*) FROM "user" u LEFT JOIN "Tutor" t ON u.id = t.userId WHERE u.role = 'TUTOR' AND t.id IS NULL) as tutorUsersWithoutTutorRecord;