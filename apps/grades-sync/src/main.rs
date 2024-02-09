use crate::faculty_repository::FacultyRepositoryImpl;
use crate::job::{JobService, JobServiceImpl};

mod faculty_repository;
mod hkdir;
mod job;
mod json;
mod pg;

fn bootstrap_environment() {
    dotenv::dotenv().ok();
    env_logger::init()
}

#[tokio::main]
async fn main() {
    bootstrap_environment();
    let connection = pg::create_postgres_pool().await.unwrap();
    let faculty_repository = FacultyRepositoryImpl::new(&connection);
    let job_service = JobServiceImpl::new(&faculty_repository);

    job_service.perform_faculty_synchronization().await.unwrap();

    println!("Hello, world!");
}
