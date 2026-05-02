-- Find invalid availability records (tutorId that doesn't exist in User table)
SELECT a.*, u.id as userExists
FROM "Availability" a
LEFT JOIN "user" u ON a.tutorId = u.id
WHERE u.id IS NULL;

-- OPTIONAL: Delete invalid availability records
-- WARNING: This will delete data!
-- DELETE FROM "Availability"
-- WHERE id IN (
--   SELECT a.id FROM "Availability" a
--   LEFT JOIN "user" u ON a.tutorId = u.id
--   WHERE u.id IS NULL
-- );