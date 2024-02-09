use crate::pg::Database;
use async_trait::async_trait;
use sqlx::types::Uuid;
use sqlx::FromRow;

#[derive(Debug, FromRow)]
pub struct Department {
    pub id: Uuid,
    pub name: String,
    pub ref_id: String,
    pub faculty_id: Uuid,
}

#[async_trait]
pub trait DepartmentRepository: Sync {
    async fn create_department(
        &self,
        name: String,
        ref_id: String,
        faculty_id: Uuid,
    ) -> Result<Department, sqlx::Error>;
}

pub struct DepartmentRepositoryImpl<'a> {
    db: &'a Database,
}

impl<'a> DepartmentRepositoryImpl<'a> {
    pub fn new(db: &'a Database) -> Self {
        Self { db }
    }
}

#[async_trait]
impl<'a> DepartmentRepository for DepartmentRepositoryImpl<'a> {
    async fn create_department(
        &self,
        name: String,
        ref_id: String,
        faculty_id: Uuid,
    ) -> Result<Department, sqlx::Error> {
        sqlx::query_as::<_, Department>(
            r#"
            INSERT INTO department (name, ref_id, faculty_id) VALUES ($1, $2, $3)
            ON CONFLICT (ref_id) DO UPDATE SET name = $1, ref_id = $2, faculty_id = $3
            RETURNING *;
            "#,
        )
        .bind(name)
        .bind(ref_id)
        .bind(faculty_id)
        .fetch_one(self.db)
        .await
    }
}
