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
  FROM "course_code_abbreviation"
  WHERE $4::text IS NOT NULL
    AND "abbreviation" ILIKE $4
)
SELECT
  matched."id",
  matched."code",
  matched."name_no" AS "nameNo",
  matched."name_en" AS "nameEn",
  matched."credits",
  matched."study_level" AS "studyLevel",
  matched."grade_type" AS "gradeType",
  matched."last_year_taught" AS "lastYearTaught",
  matched."candidate_count" AS "candidateCount",
  matched."average_grade" AS "averageGrade",
  matched."pass_rate" AS "passRate",
  to_jsonb(matched."taught_semesters") AS "taughtSemesters",
  to_jsonb(matched."teaching_languages") AS "teachingLanguages",
  to_jsonb(matched."campuses") AS "campuses",
  -- Subquery to count the total number of courses that match the filter, regardless of limit and offset.
  -- Uses exactly the same filter as the main query, but without the expensive course_rank_score function.
  (
    SELECT COUNT(*)::int
    -- Two branches, first runs if search is null, second runs if search is not null. This is so that indexes are used for the search term.
    -- 1. If search is null, we count all courses that match the filter.
    -- 2. If search is not null, we count all courses that match the filter and the search term.
    FROM (
      SELECT 1
      FROM "course" counted
      WHERE $4::text IS NULL
        AND (
          cardinality($5::"semester"[]) = 0
          OR counted."taught_semesters" && $5::"semester"[]
        )
        AND (
          cardinality($6::"teaching_language"[]) = 0
          OR counted."teaching_languages" && $6::"teaching_language"[]
        )
        AND (
          cardinality($7::"campus"[]) = 0
          OR counted."campuses" && $7::"campus"[]
        )
        AND (
          $8::double precision IS NULL
          OR counted."average_grade" >= $8
        )
        AND counted."candidate_count" > 0
      UNION ALL
      SELECT 1
      FROM "course" counted
      INNER JOIN search_ids ON search_ids."id" = counted."id"
      WHERE $4::text IS NOT NULL
        AND (
          cardinality($5::"semester"[]) = 0
          OR counted."taught_semesters" && $5::"semester"[]
        )
        AND (
          cardinality($6::"teaching_language"[]) = 0
          OR counted."teaching_languages" && $6::"teaching_language"[]
        )
        AND (
          cardinality($7::"campus"[]) = 0
          OR counted."campuses" && $7::"campus"[]
        )
        AND (
          $8::double precision IS NULL
          OR counted."average_grade" >= $8
        )
        AND counted."candidate_count" > 0
    ) counted
  ) AS "totalCount"
  -- Main query to fetch the courses.
  -- Two branches, first runs if search is null, second runs if search is not null. This is so that indexes are used for the search term.
  -- 1. If search is null, we fetch all courses that match the filter.
  -- 2. If search is not null, we fetch all courses that match the filter and the search term.
FROM (
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
    ARRAY[]::text[] AS abbreviations
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
    COALESCE(abbr.abbreviations, ARRAY[]::text[]) AS abbreviations
  FROM "course" course
  INNER JOIN search_ids ON search_ids."id" = course."id"
  LEFT JOIN (
    SELECT
      course_id,
      array_agg(abbreviation) AS abbreviations
    FROM "course_code_abbreviation"
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
) matched
ORDER BY
  (matched."last_year_taught" IS NULL) DESC,
  CASE
    WHEN $3::text IS NULL OR btrim($3) = '' THEN NULL
    ELSE course_rank_score(
      matched."code",
      matched.abbreviations,
      matched."name_no",
      matched."name_en",
      $3
    )
  END DESC,

  CASE WHEN $9 = 'asc' THEN
    CASE $10
      WHEN 'AVERAGE_GRADE' THEN matched."average_grade"
      WHEN 'PASS_RATE' THEN matched."pass_rate"
      WHEN 'CANDIDATE_COUNT' THEN matched."candidate_count"::double precision
    END
  END ASC NULLS LAST,
  CASE WHEN $9 = 'desc' THEN
    CASE $10
      WHEN 'AVERAGE_GRADE' THEN matched."average_grade"
      WHEN 'PASS_RATE' THEN matched."pass_rate"
      WHEN 'CANDIDATE_COUNT' THEN matched."candidate_count"::double precision
    END
  END DESC NULLS LAST,

  CASE WHEN $9 = 'asc' THEN
    CASE $11
      WHEN 'AVERAGE_GRADE' THEN matched."average_grade"
      WHEN 'PASS_RATE' THEN matched."pass_rate"
      WHEN 'CANDIDATE_COUNT' THEN matched."candidate_count"::double precision
    END
  END ASC NULLS LAST,
  CASE WHEN $9 = 'desc' THEN
    CASE $11
      WHEN 'AVERAGE_GRADE' THEN matched."average_grade"
      WHEN 'PASS_RATE' THEN matched."pass_rate"
      WHEN 'CANDIDATE_COUNT' THEN matched."candidate_count"::double precision
    END
  END DESC NULLS LAST,

  CASE WHEN $9 = 'asc' THEN
    CASE $12
      WHEN 'AVERAGE_GRADE' THEN matched."average_grade"
      WHEN 'PASS_RATE' THEN matched."pass_rate"
      WHEN 'CANDIDATE_COUNT' THEN matched."candidate_count"::double precision
    END
  END ASC NULLS LAST,
  CASE WHEN $9 = 'desc' THEN
    CASE $12
      WHEN 'AVERAGE_GRADE' THEN matched."average_grade"
      WHEN 'PASS_RATE' THEN matched."pass_rate"
      WHEN 'CANDIDATE_COUNT' THEN matched."candidate_count"::double precision
    END
  END DESC NULLS LAST,

  matched."id" DESC
OFFSET $1
LIMIT $2;
