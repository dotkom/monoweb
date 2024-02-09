use crate::faculty_repository::{FacultyRepository};
use crate::hkdir::get_departments;

use log::info;
use tokio::task::JoinSet;

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
        let _processed_count = 0;
        info!(
            "performing synchronization for {} departments",
            departments.len()
        );
        let mut set = JoinSet::new();
        for (i, _department) in departments.iter().enumerate() {
            set.spawn(async move {
                info!("processing department {}", i);
            });
        }

        while let Some(result) = set.join_next().await {
            result?;
        }
        Ok(())
    }

    async fn perform_department_synchronization(&self) -> anyhow::Result<()> {
        Ok(())
    }

    async fn perform_grade_synchronization(&self) -> anyhow::Result<()> {
        Ok(())
    }
}
