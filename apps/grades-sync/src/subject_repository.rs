use crate::grade_repository::SubjectGradingKey;
use crate::pg::Database;
use async_trait::async_trait;
use sqlx::types::Uuid;
use sqlx::{Error, FromRow};

#[derive(Debug, FromRow)]
pub struct Subject {
    pub id: Uuid,
    pub ref_id: String,
    pub name: String,
    pub department_id: Uuid,
    pub slug: String,
    pub instruction_language: String,
    pub educational_level: String,
    pub credits: f32,
    pub average_grade: f32,
    pub total_students: i32,
    pub failed_students: i32,
}

impl Subject {
    pub fn get_next_average(&self, key: SubjectGradingKey, count: i32) -> f32 {
        if key.is_pass_or_fail_key() {
            return self.average_grade;
        }

        let complete_factor = self.average_grade * self.total_students as f32
            + count as f32 * key.to_multiplication_factor();
        complete_factor / (self.total_students + count) as f32
    }

    pub fn get_next_failed_students(&self, key: SubjectGradingKey, count: i32) -> i32 {
        if key.is_evaluated_as_failed() {
            return self.failed_students + count;
        }
        self.failed_students
    }

    pub fn get_next_total_students(&self, count: i32) -> i32 {
        self.total_students + count
    }
}

#[async_trait]
pub trait SubjectRepository: Sync {
    async fn create_subject(
        &self,
        ref_id: String,
        name: String,
        department_id: Uuid,
        slug: String,
        instruction_language: String,
        educational_level: String,
        credits: f32,
        average_grade: f32,
        total_students: i32,
        failed_students: i32,
    ) -> Result<Subject, sqlx::Error>;
    async fn find_subject_by_ref_id(&self, ref_id: String) -> Result<Option<Subject>, sqlx::Error>;
}

pub struct SubjectRepositoryImpl<'a> {
    db: &'a Database,
}

impl<'a> SubjectRepositoryImpl<'a> {
    pub fn new(db: &'a Database) -> Self {
        Self { db }
    }
}

#[async_trait]
impl<'a> SubjectRepository for SubjectRepositoryImpl<'a> {
    async fn create_subject(
        &self,
        ref_id: String,
        name: String,
        department_id: Uuid,
        slug: String,
        instruction_language: String,
        educational_level: String,
        credits: f32,
        average_grade: f32,
        total_students: i32,
        failed_students: i32,
    ) -> Result<Subject, sqlx::Error> {
        sqlx::query_as::<_, Subject>(
            r#"
            INSERT INTO subject (ref_id, name, department_id, slug, instruction_language, educational_level, credits, average_grade, total_students, failed_students)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (ref_id) DO UPDATE SET name = $2, department_id = $3, slug = $4, instruction_language = $5, educational_level = $6, credits = $7
            RETURNING *;
            "#,
        )
        .bind(ref_id)
        .bind(name)
        .bind(department_id)
        .bind(slug)
        .bind(instruction_language)
        .bind(educational_level)
        .bind(credits)
        .bind(average_grade)
        .bind(total_students)
        .bind(failed_students)
        .fetch_one(self.db)
        .await
    }

    async fn find_subject_by_ref_id(&self, ref_id: String) -> Result<Option<Subject>, Error> {
        sqlx::query_as::<_, Subject>(
            r#"
            SELECT * FROM subject WHERE ref_id = $1;
            "#,
        )
        .bind(ref_id)
        .fetch_optional(self.db)
        .await
    }
}
