SELECT
	"attendanceId"
FROM
	"attendance_pool"
LEFT JOIN "attendance" ON "attendance"."id" = "attendance_pool"."attendanceId"
WHERE
	"mergeDelayHours" IS NOT NULL AND
	NOW() > "attendance"."registerStart" + interval '1 hour' * attendance_pool."mergeDelayHours"