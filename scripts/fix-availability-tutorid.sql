-- Fix Existing Availabilities with Invalid tutorId
-- First identify problematic records
SELECT a.*, u.id as userExists 
FROM "Availability" a 
LEFT JOIN "user" u ON a.tutorId = u.id 
WHERE u.id IS NULL;

-- If you want to delete invalid availability records (OPTION 1 - SAFE):
-- DELETE FROM "Availability" 
-- WHERE id IN (
--   SELECT a.id FROM "Availability" a 
--   LEFT JOIN "user" u ON a.tutorId = u.id 
--   WHERE u.id IS NULL
-- );

-- OR if you want to fix them by setting tutorId to a valid tutor user (OPTION 2 - NEEDS MANUAL REVIEW):
-- You need to decide which valid tutor should own these records.
-- Example: set to a specific tutor user id
-- UPDATE "Availability" 
-- SET tutorId = 'valid-tutor-user-id-here'
-- WHERE id IN (...);