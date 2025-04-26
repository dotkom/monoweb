-- AlterEnum
ALTER TYPE "company_type" ADD VALUE 'UNKNOWN';

-- AlterTable
ALTER TABLE "company" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;


-- Manual DATA Migration BELLOW:

-- After running the queries, copy the results, do this to apply results:
-- Ctr + F -> Replace "I with I 
--          -> Replace ;" with ; 
--          -> Replace "" with "
-- RUN QUERY

-- Query for copy of Company query
-- SELECT 
--   'INSERT INTO company (id, "createdAt", name, description, phone, email, website, location, type, image, slug) VALUES (' ||
--     companyprofile_company.id || ', ' ||
--     COALESCE(quote_literal(created_date), 'NULL') || ', ' ||
--     COALESCE(quote_literal(companyprofile_company.name), 'NULL') || ', ' ||
--     COALESCE(quote_literal(long_description), 'NULL') || ', ' ||
--     COALESCE(quote_literal(phone_number), 'NULL') || ', ' ||
--     COALESCE(quote_literal(email_address), 'NULL') || ', ' ||
--     COALESCE(quote_literal(site), 'NULL') || ', ' ||
--     'NULL, ' ||  -- location is always NULL
--     quote_literal('UNKNOWN') || ', ' ||
--     COALESCE(quote_literal('https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/' || gallery_responsiveimage.image_original), 'NULL') || ', ' ||
--     COALESCE(quote_literal(REPLACE(companyprofile_company.name, ' ', '_') || '_' || companyprofile_company.id), 'NULL') ||
--   ');'
-- FROM companyprofile_company
-- JOIN gallery_responsiveimage
--   ON companyprofile_company.image_id = gallery_responsiveimage.id;


-- Query for copy of job listings query
-- SELECT 
--   'INSERT INTO job_listing (id, "createdAt", "companyId", title, ingress, description, start, "end", featured, deadline, "applicationLink", "applicationEmail", employment, "deadlineAsap", hidden) VALUES ('
--   || id || ', '
--   || 'NOW(), '
--   || company_id || ', '
--   || quote_literal(COALESCE(title, '')) || ', '
--   || quote_literal(COALESCE(ingress, '')) || ', '
--   || quote_literal(COALESCE(description, '')) || ', '
--   || COALESCE(quote_literal(start::text), 'NULL') || ', '
--   || COALESCE(quote_literal("end"::text), 'NULL') || ', '
--   || featured || ', '
--   || COALESCE(quote_literal(deadline::text), 'NULL') || ', '
--   || quote_literal(COALESCE(application_link, '')) || ', '
--   || quote_literal(COALESCE(application_email, '')) || ', '
--   || CASE employment
--        WHEN 1 THEN quote_literal('FULLTIME')
--        WHEN 2 THEN quote_literal('PARTTIME')
--        WHEN 3 THEN quote_literal('SUMMER_INTERNSHIP')
--        ELSE quote_literal('OTHER')
--      END || ', '
--   || rolling_admission || ', '
--   || 'false'
--   || ');'
-- FROM careeropportunity_careeropportunity;



