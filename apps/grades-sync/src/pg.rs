use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres};

pub type Database = Pool<Postgres>;

pub async fn create_postgres_pool() -> Result<Pool<Postgres>, sqlx::Error> {
    let database_url =
        std::env::var("DATABASE_URL").expect("missing DATABASE_URL environment variable");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;
    Ok(pool)
}
