use async_trait::async_trait;
use crate::pg::Database;
use sqlx::types::Uuid;
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct Faculty {
    pub id: Uuid,
    pub name: String,
    pub ref_id: String,
}

#[async_trait]
pub trait FacultyRepository: Sync {
    async fn create_faculty(&self, name: String, ref_id: String) -> Result<Faculty, sqlx::Error>;
    async fn get_faculty_by_ref_id(&self, ref_id: &str) -> Result<Option<Faculty>, sqlx::Error>;
}

pub struct FacultyRepositoryImpl<'a> {
    db: &'a Database,
}

impl<'a> FacultyRepositoryImpl<'a> {
    pub fn new(db: &'a Database) -> Self {
        Self { db }
    }
}

#[async_trait]
impl<'a> FacultyRepository for FacultyRepositoryImpl<'a> {
    async fn create_faculty(&self, name: String, ref_id: String) -> Result<Faculty, sqlx::Error> {
        sqlx::query_as::<_, Faculty>(
            r#"
            INSERT INTO faculty (name, ref_id) VALUES ($1, $2)
            ON CONFLICT (ref_id) DO UPDATE SET name = $1, ref_id = $2
            RETURNING *;
            "#,
        )
        .bind(name)
        .bind(ref_id)
        .fetch_one(self.db)
        .await
    }

    async fn get_faculty_by_ref_id(&self, ref_id: &str) -> Result<Option<Faculty>, sqlx::Error> {
        sqlx::query_as::<_, Faculty>(
            r#"
            SELECT * FROM faculty WHERE ref_id = $1
            "#,
        )
        .bind(ref_id)
        .fetch_optional(self.db)
        .await
    }
}
