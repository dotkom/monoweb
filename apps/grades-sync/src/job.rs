use std::cmp::{min};
use crate::faculty_repository::{FacultyRepository};
use crate::hkdir::{get_departments, get_subjects};
use async_trait::async_trait;
use itertools::Itertools;


use crate::department_repository::{DepartmentRepository};
use crate::json::{HkdirDepartment, HkdirSubject};
use crate::subject_repository::{SubjectRepository};
use log::info;
use regex::Regex;

#[async_trait]
pub trait JobService: Sync {
    async fn perform_faculty_synchronization(&self) -> anyhow::Result<()>;
    async fn perform_subject_synchronization(&self) -> anyhow::Result<()>;
    async fn perform_grade_synchronization(&self) -> anyhow::Result<()>;

    async fn synchronize_single_faculty(&self, faculty: HkdirDepartment) -> anyhow::Result<()>;
    async fn synchronize_single_subject(&self, subject: HkdirSubject) -> anyhow::Result<()>;
}

pub struct JobServiceImpl<'a> {
    faculty_repository: &'a dyn FacultyRepository,
    department_repository: &'a dyn DepartmentRepository,
    subject_repository: &'a dyn SubjectRepository,
}

impl<'a> JobServiceImpl<'a> {
    pub fn new(
        faculty_repository: &'a dyn FacultyRepository,
        department_repository: &'a dyn DepartmentRepository,
        subject_repository: &'a dyn SubjectRepository,
    ) -> Self {
        Self {
            faculty_repository,
            department_repository,
            subject_repository,
        }
    }
}

const MAX_TASK_COUNT: usize = 100;

#[async_trait]
impl<'a> JobService for JobServiceImpl<'a> {
    async fn perform_faculty_synchronization(&self) -> anyhow::Result<()> {
        info!("performing faculty synchronization");
        let departments = get_departments().await?;
        let department_count = departments.len();
        let chunks_count = min(department_count / MAX_TASK_COUNT, 1000);
        info!(
            "performing synchronization for {} departments across {} threads",
            department_count,
            chunks_count
        );

        let departments_chunked = departments
            .into_iter()
            .chunks(chunks_count)
            .into_iter()
            .map(|chunk| chunk.collect())
            .collect::<Vec<Vec<HkdirDepartment>>>();
        async_scoped::TokioScope::scope_and_block(|s| {
            for departments in departments_chunked {
                s.spawn(async move {
                    for department in departments {
                        self.synchronize_single_faculty(department).await.unwrap();
                    }
                });
            }
        });
        info!("synchronization complete");
        Ok(())
    }

    async fn perform_subject_synchronization(&self) -> anyhow::Result<()> {
        info!("performing subject synchronization");
        let subjects = get_subjects().await?;
        let subject_count = subjects.len();
        let chunks_count = min(subject_count / MAX_TASK_COUNT, 1000);
        info!(
            "performing synchronization for {} subjects across {} threads",
            subject_count,
            chunks_count
        );

        let subjects_chunked = subjects
            .into_iter()
            .chunks(chunks_count)
            .into_iter()
            .map(|chunk| chunk.collect())
            .collect::<Vec<Vec<HkdirSubject>>>();
        async_scoped::TokioScope::scope_and_block(|s| {
            for subjects in subjects_chunked {
                s.spawn(async move {
                    for subject in subjects {
                        self.synchronize_single_subject(subject).await.unwrap();
                    }
                });
            }
        });

        info!("synchronization complete");
        Ok(())
    }

    async fn perform_grade_synchronization(&self) -> anyhow::Result<()> {
        Ok(())
    }

    async fn synchronize_single_faculty(&self, department: HkdirDepartment) -> anyhow::Result<()> {
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
                department.department_name,
                department.department_code,
                faculty.id,
            )
            .await
            .unwrap();
        Ok(())
    }

    async fn synchronize_single_subject(&self, subject: HkdirSubject) -> anyhow::Result<()> {
        // Forge a slug from the subject name. A lot of the subject code fields from
        // HKDir have a -1 or another number appended to them, which is not useful
        // because we're using to seeing 'TDT4120' instead of 'TDT4120-1'.
        let re = Regex::new("-[A-Za-z0-9]+$").unwrap();
        let slug = re.replace_all(&subject.subject_code, "").to_lowercase();
        // Find a reference to the department.
        let department = self
            .department_repository
            .get_department_by_ref_id(subject.department_code)
            .await
            .unwrap();

        // Create the subject if it doesn't exist. The underlying query performs an on
        // conflict update, which means that we do not need to check if the subject
        // exists before creating it.
        self.subject_repository
            .create_subject(
                subject.subject_code,
                subject.subject_name,
                department.id,
                slug,
                subject.instruction_language,
                subject.level_code,
                subject.credits.parse().unwrap(),
                0f32,
                0,
                0,
            )
            .await
            .unwrap();
        Ok(())
    }
}
