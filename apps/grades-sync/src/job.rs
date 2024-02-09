
use crate::faculty_repository::FacultyRepository;
use crate::hkdir::get_departments;

use log::info;


pub trait JobService {
    async fn perform_faculty_synchronization(&self) -> anyhow::Result<()>;
    async fn perform_department_synchronization(&self) -> anyhow::Result<()>;
    async fn perform_grade_synchronization(&self) -> anyhow::Result<()>;
}

pub struct JobServiceImpl<'a> {
    faculty_repository: &'a dyn FacultyRepository,
}

impl<'a> JobServiceImpl<'a> {
    pub fn new(faculty_repository: &'a dyn FacultyRepository) -> Self {
        Self { faculty_repository }
    }
}

impl<'a> JobService for JobServiceImpl<'a> {
    async fn perform_faculty_synchronization(&self) -> anyhow::Result<()> {
        info!("performing faculty synchronization");
        let departments = get_departments().await?;
        let department_count = departments.len();
        info!(
            "performing synchronization for {} departments",
            department_count
        );

        async_scoped::TokioScope::scope_and_block(|s| {
            for department in departments {
                s.spawn(async move {
                    // Create the faculty if it doesn't exist. The underlying query performs an on
                    // conflict update, which means that we do not need to check if the faculty
                    // exists before creating it.
                    self
                        .faculty_repository
                        .create_faculty(department.faculty_code, department.faculty_name)
                        .await
                        .unwrap();
                });
            }
        });
        Ok(())
    }

    async fn perform_department_synchronization(&self) -> anyhow::Result<()> {
        Ok(())
    }

    async fn perform_grade_synchronization(&self) -> anyhow::Result<()> {
        Ok(())
    }
}
