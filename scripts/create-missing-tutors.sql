-- Migration Script: Create Missing Tutor Records for Users with TUTOR Role
-- This will create Tutor records for any User with role='TUTOR' that doesn't have one

-- First, let's see what we're about to create
SELECT 
  u.id as userId,
  u.name,
  u.email,
  u.role
FROM "user" u 
LEFT JOIN "Tutor" t ON u.id = t.userId 
WHERE u.role = 'TUTOR' AND t.id IS NULL;

-- Create missing Tutor records
INSERT INTO "Tutor" (id, userId, name, email, bio, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid() as id,
  u.id as userId,
  u.name as name,
  u.email as email,
  '' as bio,
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM "user" u 
LEFT JOIN "Tutor" t ON u.id = t.userId 
WHERE u.role = 'TUTOR' AND t.id IS NULL;

-- Verify the insertion
SELECT 
  t.id as tutorId,
  t.userId,
  t.name,
  t.email,
  u.role
FROM "Tutor" t
JOIN "user" u ON t.userId = u.id
WHERE u.role = 'TUTOR'
ORDER BY t.createdAt DESC;