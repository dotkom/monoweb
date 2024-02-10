use log::LevelFilter;
use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use sqlx::{ConnectOptions, Pool, Postgres};
use std::time::Duration;

pub type Database = Pool<Postgres>;

pub async fn create_postgres_pool() -> Result<Pool<Postgres>, sqlx::Error> {
    let database_url =
        std::env::var("DATABASE_URL").expect("missing DATABASE_URL environment variable");
    let max_connections = std::env::var("MAX_CONNECTIONS")
        .unwrap_or_else(|_| "10".to_string())
        .parse::<u32>()
        .expect("MAX_CONNECTIONS must be a number");

    let opts: PgConnectOptions = database_url.parse()?;
    let opts = opts
        .log_statements(LevelFilter::Debug)
        .log_slow_statements(LevelFilter::Warn, Duration::from_secs(1));
    let pool = PgPoolOptions::new()
        .max_connections(max_connections)
        .acquire_timeout(Duration::from_secs(10 * 60))
        .connect_with(opts)
        .await?;
    Ok(pool)
}
