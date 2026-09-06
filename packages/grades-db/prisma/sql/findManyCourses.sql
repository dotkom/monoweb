-- @param {Int} $1:offset
-- @param {Int} $2:limit
-- @param {String} $3:search?
-- @param {String} $4:searchContains?
-- @param {Float} $8:minAverageGrade?
-- @param {String} $9:sortOrder
-- @param {String} $10:firstSortBy?
-- @param {String} $11:secondSortBy?
-- @param {String} $12:thirdSortBy?

-- DOCS: https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/typedsql

-- First, we find the IDs of the courses that match the search term.
-- Using UNION so that indexes can be used on the individual columns.
WITH search_ids AS (
  SELECT "id"
  FROM "course"
  WHERE $4::text IS NOT NULL
    AND "code" ILIKE $4
  UNION
  SELECT "id"
  FROM "course"
  WHERE $4::text IS NOT NULL
    AND "name_no" ILIKE $4
  UNION
  SELECT "id"
  FROM "course"
  WHERE $4::text IS NOT NULL
    AND "name_en" ILIKE $4
  UNION
  SELECT "course_id" AS "id"
  FROM "course_alias"
  WHERE $4::text IS NOT NULL
    AND "alias" ILIKE $4
),
-- Filter once. Two branches so indexes are used when searching.
-- 1. search is null: all courses matching filters
-- 2. search is not null: courses matching filters and search_ids
filtered AS (
  SELECT
    course."id",
    course."code",
    course."name_no",
    course."name_en",
    course."credits",
    course."study_level",
    course."grade_type",
    course."last_year_taught",
    course."candidate_count",
    course."average_grade",
    course."pass_rate",
    course."taught_semesters",
    course."teaching_languages",
    course."campuses",
    ARRAY[]::text[] AS aliases
  FROM "course" course
  WHERE $4::text IS NULL
    AND (
      cardinality($5::"semester"[]) = 0
      OR course."taught_semesters" && $5::"semester"[]
    )
    AND (
      cardinality($6::"teaching_language"[]) = 0
      OR course."teaching_languages" && $6::"teaching_language"[]
    )
    AND (
      cardinality($7::"campus"[]) = 0
      OR course."campuses" && $7::"campus"[]
    )
    AND (
      $8::double precision IS NULL
      OR course."average_grade" >= $8
    )
    AND course."candidate_count" > 0
  UNION ALL
  SELECT
    course."id",
    course."code",
    course."name_no",
    course."name_en",
    course."credits",
    course."study_level",
    course."grade_type",
    course."last_year_taught",
    course."candidate_count",
    course."average_grade",
    course."pass_rate",
    course."taught_semesters",
    course."teaching_languages",
    course."campuses",
    COALESCE(abbr.aliases, ARRAY[]::text[]) AS aliases
  FROM "course" course
  INNER JOIN search_ids ON search_ids."id" = course."id"
  LEFT JOIN (
    SELECT
      course_id,
      array_agg(alias) AS aliases
    FROM "course_alias"
    GROUP BY course_id
  ) abbr ON abbr.course_id = course."id"
  WHERE $4::text IS NOT NULL
    AND (
      cardinality($5::"semester"[]) = 0
      OR course."taught_semesters" && $5::"semester"[]
    )
    AND (
      cardinality($6::"teaching_language"[]) = 0
      OR course."teaching_languages" && $6::"teaching_language"[]
    )
    AND (
      cardinality($7::"campus"[]) = 0
      OR course."campuses" && $7::"campus"[]
    )
    AND (
      $8::double precision IS NULL
      OR course."average_grade" >= $8
    )
    AND course."candidate_count" > 0
),
page AS (
  SELECT
    filtered."id",
    filtered."code",
    filtered."name_no",
    filtered."name_en",
    filtered."credits",
    filtered."study_level",
    filtered."grade_type",
    filtered."last_year_taught",
    filtered."candidate_count",
    filtered."average_grade",
    filtered."pass_rate",
    filtered."taught_semesters",
    filtered."teaching_languages",
    filtered."campuses",
    COUNT(*) OVER()::int AS total_count
  FROM filtered
  ORDER BY
    (filtered."last_year_taught" IS NULL) DESC,
    CASE
      WHEN $3::text IS NULL OR btrim($3) = '' THEN NULL
      ELSE course_rank_score(
        filtered."code",
        filtered.aliases,
        filtered."name_no",
        filtered."name_en",
        $3
      )
    END DESC,

    CASE WHEN $9 = 'asc' THEN
      CASE $10
        WHEN 'AVERAGE_GRADE' THEN filtered."average_grade"
        WHEN 'PASS_RATE' THEN filtered."pass_rate"
        WHEN 'CANDIDATE_COUNT' THEN filtered."candidate_count"::double precision
      END
    END ASC NULLS LAST,
    CASE WHEN $9 = 'desc' THEN
      CASE $10
        WHEN 'AVERAGE_GRADE' THEN filtered."average_grade"
        WHEN 'PASS_RATE' THEN filtered."pass_rate"
        WHEN 'CANDIDATE_COUNT' THEN filtered."candidate_count"::double precision
      END
    END DESC NULLS LAST,

    CASE WHEN $9 = 'asc' THEN
      CASE $11
        WHEN 'AVERAGE_GRADE' THEN filtered."average_grade"
        WHEN 'PASS_RATE' THEN filtered."pass_rate"
        WHEN 'CANDIDATE_COUNT' THEN filtered."candidate_count"::double precision
      END
    END ASC NULLS LAST,
    CASE WHEN $9 = 'desc' THEN
      CASE $11
        WHEN 'AVERAGE_GRADE' THEN filtered."average_grade"
        WHEN 'PASS_RATE' THEN filtered."pass_rate"
        WHEN 'CANDIDATE_COUNT' THEN filtered."candidate_count"::double precision
      END
    END DESC NULLS LAST,

    CASE WHEN $9 = 'asc' THEN
      CASE $12
        WHEN 'AVERAGE_GRADE' THEN filtered."average_grade"
        WHEN 'PASS_RATE' THEN filtered."pass_rate"
        WHEN 'CANDIDATE_COUNT' THEN filtered."candidate_count"::double precision
      END
    END ASC NULLS LAST,
    CASE WHEN $9 = 'desc' THEN
      CASE $12
        WHEN 'AVERAGE_GRADE' THEN filtered."average_grade"
        WHEN 'PASS_RATE' THEN filtered."pass_rate"
        WHEN 'CANDIDATE_COUNT' THEN filtered."candidate_count"::double precision
      END
    END DESC NULLS LAST,

    filtered."id" DESC
  OFFSET $1
  LIMIT $2
)
SELECT
  page."id",
  page."code",
  page."name_no" AS "nameNo",
  page."name_en" AS "nameEn",
  page."credits",
  page."study_level" AS "studyLevel",
  page."grade_type" AS "gradeType",
  page."last_year_taught" AS "lastYearTaught",
  page."candidate_count" AS "candidateCount",
  page."average_grade" AS "averageGrade",
  page."pass_rate" AS "passRate",
  to_jsonb(page."taught_semesters") AS "taughtSemesters",
  to_jsonb(page."teaching_languages") AS "teachingLanguages",
  to_jsonb(page."campuses") AS "campuses",
  page.total_count AS "totalCount"
FROM page;
