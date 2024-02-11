use crate::faculty_repository::FacultyRepository;
use crate::hkdir::{get_departments, get_grades, get_subjects, map_season_index_to};
use async_trait::async_trait;
use itertools::{Itertools};
use lazy_static::lazy_static;

use crate::department_repository::DepartmentRepository;
use crate::grade_repository::GradeRepository;
use crate::json::{HkdirDepartment, HkdirGrade, HkdirSubject};
use crate::subject_repository::SubjectRepository;
use log::{info, warn};
use regex::Regex;

lazy_static! {
    static ref SUFFIX_REGEX: Regex = Regex::new("-[A-Za-z0-9]+$").unwrap();
}

#[async_trait]
pub trait JobService: Sync {
    async fn perform_faculty_synchronization(&self) -> anyhow::Result<()>;
    async fn perform_subject_synchronization(&self) -> anyhow::Result<()>;
    async fn perform_grade_synchronization(&self) -> anyhow::Result<()>;

    async fn synchronize_single_faculty(&self, faculty: HkdirDepartment) -> anyhow::Result<()>;
    async fn synchronize_single_subject(&self, subject: HkdirSubject) -> anyhow::Result<()>;
    async fn synchronize_single_grade(&self, grade: HkdirGrade) -> anyhow::Result<()>;
}

pub struct JobServiceImpl<'a> {
    faculty_repository: &'a dyn FacultyRepository,
    department_repository: &'a dyn DepartmentRepository,
    subject_repository: &'a dyn SubjectRepository,
    grade_repository: &'a dyn GradeRepository,
}

impl<'a> JobServiceImpl<'a> {
    pub fn new(
        faculty_repository: &'a dyn FacultyRepository,
        department_repository: &'a dyn DepartmentRepository,
        subject_repository: &'a dyn SubjectRepository,
        grade_repository: &'a dyn GradeRepository,
    ) -> Self {
        Self {
            faculty_repository,
            department_repository,
            subject_repository,
            grade_repository,
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
            "performing synchronization for {} departments", department_count
        );

        futures::future::join_all(departments
            .into_iter()
            .map(|department| {
                async move {
                    self.synchronize_single_faculty(department).await.unwrap();
                }
            })).await;
        info!("synchronization complete");
        Ok(())
    }

    async fn perform_subject_synchronization(&self) -> anyhow::Result<()> {
        info!("performing subject synchronization");
        let subjects = get_subjects().await?;
        let subject_count = subjects.len();
        info!(
            "performing synchronization for {} subjects",
            subject_count
        );

        futures::future::join_all(subjects
            .into_iter()
            .map(|subject| {
                async move {
                    self.synchronize_single_subject(subject).await.unwrap();
                }
            })).await;
        info!("synchronization complete");
        Ok(())
    }

    async fn perform_grade_synchronization(&self) -> anyhow::Result<()> {
        info!("performing grade synchronization");
        let grades = get_grades().await?;
        info!(
            "performing synchronization for {} grades",
            grades.len()
        );
        let map = grades.into_iter()
            .filter(|grade| grade
                .total_candidates
                .parse::<i32>()
                .expect("invalid number for total candidates") > 0
            )
            .into_grouping_map_by(|grade| grade.subject_code.clone())
            // TODO: Maybe there is a way to avoid this collect?
            .collect::<Vec<_>>();
        futures::future::join_all(map.into_values().map(|grades| {
                async move {
                    for grade in grades {
                        self.synchronize_single_grade(grade).await.unwrap();
                    }
                }
            })).await;
        info!("synchronization complete");
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
        let slug = SUFFIX_REGEX.replace_all(&subject.subject_code, "").to_lowercase();
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

    async fn synchronize_single_grade(&self, grade: HkdirGrade) -> anyhow::Result<()> {
        // First we find the matching subject, or else we return early.
        let subject = match self
            .subject_repository
            .find_subject_by_ref_id(grade.subject_code.clone())
            .await?
        {
            Some(subject) => subject,
            // TODO: Determine under which circumstances the subject doesn't actually exist before
            //  we attempt to synchronize grades for it.
            None => {
                warn!("subject {} does not exist", grade.subject_code);
                return Ok(())
            },
        };
        let year = grade.year.parse::<i32>().unwrap();
        let season_key = map_season_index_to(grade.semester.as_str());
        // Then we find a matching grade record.
        self.grade_repository
            .update_grade_record(
                subject.id,
                season_key,
                year,
                grade.grade,
                grade
                    .total_candidates
                    .parse::<i32>()
                    .expect("invalid number for total candidates"),
            )
            .await?;

        Ok(())
    }
}
