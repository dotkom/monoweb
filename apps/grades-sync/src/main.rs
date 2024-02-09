use crate::department_repository::DepartmentRepositoryImpl;
use crate::faculty_repository::FacultyRepositoryImpl;
use crate::job::{JobService, JobServiceImpl};
use crate::subject_repository::SubjectRepositoryImpl;

mod department_repository;
mod faculty_repository;
mod hkdir;
mod job;
mod json;
mod pg;
mod subject_repository;

fn bootstrap_environment() {
    dotenv::dotenv().ok();
    env_logger::init()
}

#[tokio::main]
async fn main() {
    bootstrap_environment();
    let pool = pg::create_postgres_pool().await.unwrap();
    let faculty_repository = FacultyRepositoryImpl::new(&pool);
    let department_repository = DepartmentRepositoryImpl::new(&pool);
    let subject_repository = SubjectRepositoryImpl::new(&pool);
    let job_service = JobServiceImpl::new(
        &faculty_repository,
        &department_repository,
        &subject_repository,
    );

    job_service.perform_faculty_synchronization().await.unwrap();
    job_service.perform_subject_synchronization().await.unwrap();

    pool.close().await;
}
