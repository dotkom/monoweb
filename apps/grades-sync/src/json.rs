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
pub struct HkdirSubject {}

#[derive(Serialize, Deserialize)]
pub struct HkdirGrade {}
