use crate::pg::Database;
use async_trait::async_trait;
use sqlx::types::Uuid;
use sqlx::FromRow;

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
}
