use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct HkdirDepartment {
    #[serde(rename = "Nivå")]
    pub level: String,
    #[serde(rename = "Nivå_tekst")]
    pub level_text: String,
    #[serde(rename = "Institusjonskode")]
    pub institution_code: String,
    #[serde(rename = "Institusjonsnavn")]
    pub institution_name: String,
    #[serde(rename = "Avdelingskode")]
    pub department_code: String,
    #[serde(rename = "Avdelingsnavn")]
    pub department_name: String,
    #[serde(rename = "Gyldig_fra")]
    pub valid_from: Option<String>,
    #[serde(rename = "Gyldig_til")]
    pub valid_to: Option<String>,
    #[serde(rename = "fagkode_avdeling")]
    pub department_subject_code: Option<String>,
    #[serde(rename = "fagnavn_avdeling")]
    pub department_subject_name: Option<String>,
    #[serde(rename = "Fakultetskode")]
    pub faculty_code: String,
    #[serde(rename = "Fakultetsnavn")]
    pub faculty_name: String,
    #[serde(rename = "Avdelingskode (3 siste siffer)")]
    pub department_code_3: String,
}

#[derive(Serialize, Deserialize)]
pub struct HkdirSubject {
    #[serde(rename = "Institusjonskode")]
    pub institution_code: String,
    #[serde(rename = "Institusjonsnavn")]
    pub institution_name: String,
    #[serde(rename = "Avdelingskode")]
    pub department_code: String,
    #[serde(rename = "Avdelingsnavn")]
    pub department_name: String,
    #[serde(rename = "Avdelingskode_SSB")]
    pub department_code_ssb: String,
    #[serde(rename = "Årstall")]
    pub year: String,
    #[serde(rename = "Semester")]
    pub semester: String,
    #[serde(rename = "Semesternavn")]
    pub semester_name: String,
    #[serde(rename = "Studieprogramkode")]
    pub study_program_code: String,
    #[serde(rename = "Studieprogramnavn")]
    pub study_program_name: String,
    #[serde(rename = "Emnekode")]
    pub subject_code: String,
    #[serde(rename = "Emnenavn")]
    pub subject_name: String,
    #[serde(rename = "Nivåkode")]
    pub level_code: String,
    #[serde(rename = "Nivånavn")]
    pub level_name: String,
    #[serde(rename = "Studiepoeng")]
    pub credits: String,
    #[serde(rename = "NUS-kode")]
    pub nus_code: String,
    #[serde(rename = "Status")]
    pub status: String,
    #[serde(rename = "Statusnavn")]
    pub status_name: String,
    #[serde(rename = "Underv.språk")]
    pub instruction_language: String,
    #[serde(rename = "Navn")]
    pub name: String,
    #[serde(rename = "Fagkode")]
    pub subject_code_department: Option<String>,
    #[serde(rename = "Fagnavn")]
    pub subject_name_department: Option<String>,
    #[serde(rename = "Oppgave (ny fra h2012)")]
    pub task: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct HkdirGrade {}
