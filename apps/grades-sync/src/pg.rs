use std::time::Duration;
use log::{LevelFilter};
use sqlx::postgres::{PgConnectOptions, PgPoolOptions};
use sqlx::{ConnectOptions, Pool, Postgres};

pub type Database = Pool<Postgres>;

pub async fn create_postgres_pool() -> Result<Pool<Postgres>, sqlx::Error> {
    let database_url =
        std::env::var("DATABASE_URL").expect("missing DATABASE_URL environment variable");
    let opts: PgConnectOptions = database_url.parse()?;
    let opts = opts.log_statements(LevelFilter::Debug)
        .log_slow_statements(LevelFilter::Warn, Duration::from_secs(1));
    let pool = PgPoolOptions::new()
        .max_connections(100)
        .connect_with(opts)
        .await?;
    Ok(pool)
}
