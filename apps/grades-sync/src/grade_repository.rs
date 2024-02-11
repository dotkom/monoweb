use crate::pg::Database;
use crate::subject_repository::Subject;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use sqlx::types::Uuid;
use sqlx::{Executor, FromRow};

#[derive(Debug, PartialEq, PartialOrd, sqlx::Type, Deserialize, Serialize, Copy, Clone)]
#[sqlx(type_name = "subject_grading_season", rename_all = "UPPERCASE")]
pub enum SubjectGradingSeason {
    Winter,
    Spring,
    Summer,
    Autumn,
}

#[derive(Serialize, Deserialize, Copy, Clone, Debug)]
pub enum SubjectGradingKey {
    A,
    B,
    C,
    D,
    E,
    F,
    G,
    H,
}

impl SubjectGradingKey {
    pub fn to_column_key_name(self) -> &'static str {
        match self {
            SubjectGradingKey::A => "graded_a",
            SubjectGradingKey::B => "graded_b",
            SubjectGradingKey::C => "graded_c",
            SubjectGradingKey::D => "graded_d",
            SubjectGradingKey::E => "graded_e",
            SubjectGradingKey::F => "graded_f",
            SubjectGradingKey::G => "graded_pass",
            SubjectGradingKey::H => "graded_fail",
        }
    }

    pub fn is_evaluated_as_failed(self) -> bool {
        matches!(self, SubjectGradingKey::F | SubjectGradingKey::H)
    }
}

#[derive(Debug, FromRow)]
pub struct Grade {
    pub id: Uuid,
    pub subject_id: Uuid,
    pub season: SubjectGradingSeason,
    pub year: i32,
    pub graded_a: Option<i32>,
    pub graded_b: Option<i32>,
    pub graded_c: Option<i32>,
    pub graded_d: Option<i32>,
    pub graded_e: Option<i32>,
    pub graded_f: Option<i32>,
    pub graded_pass: Option<i32>,
    pub graded_fail: Option<i32>,
}

impl Grade {
    pub fn has_previously_been_graded(&self, key: SubjectGradingKey) -> bool {
        match key {
            SubjectGradingKey::A => self.graded_a.is_some(),
            SubjectGradingKey::B => self.graded_b.is_some(),
            SubjectGradingKey::C => self.graded_c.is_some(),
            SubjectGradingKey::D => self.graded_d.is_some(),
            SubjectGradingKey::E => self.graded_e.is_some(),
            SubjectGradingKey::F => self.graded_f.is_some(),
            SubjectGradingKey::G => self.graded_pass.is_some(),
            SubjectGradingKey::H => self.graded_fail.is_some(),
        }
    }
}

#[async_trait]
pub trait GradeRepository: Sync {
    async fn create_grade(
        &self,
        subject_id: Uuid,
        season: SubjectGradingSeason,
        year: i32,
        graded_a: Option<i32>,
        graded_b: Option<i32>,
        graded_c: Option<i32>,
        graded_d: Option<i32>,
        graded_f: Option<i32>,
        graded_pass: Option<i32>,
        graded_fail: Option<i32>,
    ) -> Result<Grade, sqlx::Error>;
    async fn update_grade_record(
        &self,
        subject_id: Uuid,
        season: SubjectGradingSeason,
        year: i32,
        key: SubjectGradingKey,
        count: i32,
    ) -> Result<Grade, sqlx::Error>;
    async fn find_grade_by_season(
        &self,
        subject_id: Uuid,
        season: SubjectGradingSeason,
        year: i32,
    ) -> Result<Option<Grade>, sqlx::Error>;
}

pub struct GradeRepositoryImpl<'a> {
    db: &'a Database,
}

impl<'a> GradeRepositoryImpl<'a> {
    pub fn new(db: &'a Database) -> Self {
        Self { db }
    }
}

#[async_trait]
impl<'a> GradeRepository for GradeRepositoryImpl<'a> {
    async fn create_grade(
        &self,
        subject_id: Uuid,
        season: SubjectGradingSeason,
        year: i32,
        graded_a: Option<i32>,
        graded_b: Option<i32>,
        graded_c: Option<i32>,
        graded_d: Option<i32>,
        graded_f: Option<i32>,
        graded_pass: Option<i32>,
        graded_fail: Option<i32>,
    ) -> Result<Grade, sqlx::Error> {
        sqlx::query_as::<_, Grade>(
            r#"
            INSERT INTO subject_season_grade (subject_id, season, year, graded_a, graded_b, graded_c, graded_d, graded_f, graded_pass, graded_fail)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *;
            "#,
        )
        .bind(subject_id)
        .bind(season)
        .bind(year)
        .bind(graded_a)
        .bind(graded_b)
        .bind(graded_c)
        .bind(graded_d)
        .bind(graded_f)
        .bind(graded_pass)
        .bind(graded_fail)
        .fetch_one(self.db)
        .await
    }

    async fn update_grade_record(
        &self,
        subject_id: Uuid,
        season: SubjectGradingSeason,
        year: i32,
        key: SubjectGradingKey,
        count: i32,
    ) -> Result<Grade, sqlx::Error> {
        // TODO: Refactor this logic out, it's only here because it's a transaction right now
        let mut tx = self.db.begin().await?;
        tx.execute("SET TRANSACTION ISOLATION LEVEL READ COMMITTED;").await?;
        let grade = sqlx::query_as::<_, Grade>(
            r#"
            SELECT * FROM subject_season_grade WHERE subject_id = $1 AND season = $2 AND year = $3
            FOR UPDATE;
            "#,
        )
        .bind(subject_id)
        .bind(season)
        .bind(year)
        .fetch_optional(&mut *tx)
        .await?;

        let grade = match grade {
            Some(grade) => grade,
            None => {
                sqlx::query_as::<_, Grade>(
                    r#"
                    INSERT INTO subject_season_grade (subject_id, season, year, graded_a, graded_b, graded_c, graded_d, graded_f, graded_pass, graded_fail)
                    VALUES ($1, $2, $3, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
                    RETURNING *;
                    "#
                ).bind(subject_id)
                .bind(season)
                .bind(year)
                .fetch_one(&mut *tx)
                    .await?
            }
        };

        // If there is already an existing grade record for the current combination of subject,
        // season and year, then we skip.
        if grade.has_previously_been_graded(key) {
            return Ok(grade);
        }

        let subject =
            sqlx::query_as::<_, Subject>(r#"SELECT * FROM subject WHERE id = $1 FOR UPDATE;"#)
                .bind(grade.subject_id)
                .fetch_one(&mut *tx)
                .await?;

        sqlx::query_as::<_, Subject>(
            r#"
            UPDATE subject SET total_students = $1, average_grade = $2, failed_students = $3 WHERE id = $4;
            "#
        )
            .bind(subject.get_next_total_students(count))
            .bind(subject.get_next_average(key, count))
            .bind(subject.get_next_failed_students(key, count))
            .bind(subject.id)
            .fetch_optional(&mut *tx)
            .await?;

        let grade = sqlx::query_as::<_, Grade>(&format!(
            r#"
                UPDATE subject_season_grade SET {} = $1
                WHERE id = $2
                RETURNING *;
                "#,
            key.to_column_key_name()
        ))
        .bind(count)
        .bind(grade.id)
        .fetch_one(&mut *tx)
        .await;

        tx.commit().await?;
        grade
    }

    async fn find_grade_by_season(
        &self,
        subject_id: Uuid,
        season: SubjectGradingSeason,
        year: i32,
    ) -> Result<Option<Grade>, sqlx::Error> {
        sqlx::query_as::<_, Grade>(
            r#"
            SELECT * FROM subject_season_grade WHERE subject_id = $1 AND season = $2 AND year = $3;
            "#,
        )
        .bind(subject_id)
        .bind(season)
        .bind(year)
        .fetch_optional(self.db)
        .await
    }
}
