use crate::pg::Database;
use sqlx::types::Uuid;
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct Faculty {
    pub id: Uuid,
    pub name: String,
    pub ref_id: String,
}

pub trait FacultyRepository: Sync {
    async fn create_faculty(&self, name: String, ref_id: String) -> Result<Faculty, sqlx::Error>
    where
        Self: Sized;
    async fn get_faculty_by_ref_id(&self, ref_id: &str) -> Result<Option<Faculty>, sqlx::Error>
    where
        Self: Sized;
}

pub struct FacultyRepositoryImpl<'a> {
    db: &'a Database,
}

impl<'a> FacultyRepositoryImpl<'a> {
    pub fn new(db: &'a Database) -> Self {
        Self { db }
    }
}

impl<'a> FacultyRepository for FacultyRepositoryImpl<'a> {
    async fn create_faculty(&self, name: String, ref_id: String) -> Result<Faculty, sqlx::Error> {
        sqlx::query_as::<_, Faculty>(
            r#"
            INSERT INTO ntnu_faculty (name, ref_id) VALUES ($1, $2)
            ON CONFLICT (ref_id) DO UPDATE SET name = $1, ref_id = $2
            RETURNING ALL
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
            SELECT * FROM ntnu_faculty WHERE ref_id = $1
            "#,
        )
        .bind(ref_id)
        .fetch_optional(self.db)
        .await
    }
}
