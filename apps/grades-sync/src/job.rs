use crate::faculty_repository::FacultyRepository;
use crate::hkdir::get_departments;
use async_trait::async_trait;

use crate::department_repository::DepartmentRepository;
use log::info;

#[async_trait]
pub trait JobService: Sync {
    async fn perform_faculty_synchronization(&self) -> anyhow::Result<()>;
    async fn perform_subject_synchronization(&self) -> anyhow::Result<()>;
    async fn perform_grade_synchronization(&self) -> anyhow::Result<()>;
}

pub struct JobServiceImpl<'a> {
    faculty_repository: &'a dyn FacultyRepository,
    department_repository: &'a dyn DepartmentRepository,
}

impl<'a> JobServiceImpl<'a> {
    pub fn new(
        faculty_repository: &'a dyn FacultyRepository,
        department_repository: &'a dyn DepartmentRepository,
    ) -> Self {
        Self {
            faculty_repository,
            department_repository,
        }
    }
}

#[async_trait]
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
                    let faculty = self
                        .faculty_repository
                        .create_faculty(department.faculty_code, department.faculty_name)
                        .await
                        .unwrap();

                    // Create the department. The same rules apply here as for the faculty.
                    self.department_repository
                        .create_department(
                            department.department_code,
                            department.department_name,
                            faculty.id,
                        )
                        .await
                        .unwrap();
                });
            }
        });
        info!("synchronization complete");
        Ok(())
    }

    async fn perform_subject_synchronization(&self) -> anyhow::Result<()> {
        Ok(())
    }

    async fn perform_grade_synchronization(&self) -> anyhow::Result<()> {
        Ok(())
    }
}
