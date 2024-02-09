use crate::grade_repository::SubjectGradingSeason;
use crate::json::{HkdirDepartment, HkdirGrade, HkdirSubject};
use reqwest::Client;
use serde_json::Value;

const HKDIR_API_URL: &str = "https://dbh.hkdir.no/api/Tabeller/hentJSONTabellData";

pub async fn get_departments() -> reqwest::Result<Vec<HkdirDepartment>> {
    let request_body = include_str!("../queries/departments.json")
        .parse::<Value>()
        .expect("invalid json");
    let client = Client::new();
    let response = client
        .post(HKDIR_API_URL)
        .json(&request_body)
        .send()
        .await?;
    response.json::<Vec<HkdirDepartment>>().await
}

pub async fn get_subjects() -> reqwest::Result<Vec<HkdirSubject>> {
    let request_body = include_str!("../queries/subjects.json")
        .parse::<Value>()
        .expect("invalid json");
    let client = Client::new();
    let response = client
        .post(HKDIR_API_URL)
        .json(&request_body)
        .send()
        .await?;
    response.json::<Vec<HkdirSubject>>().await
}

pub async fn get_grades() -> reqwest::Result<Vec<HkdirGrade>> {
    let request_body = include_str!("../queries/grades.json")
        .parse::<Value>()
        .expect("invalid json");
    let client = Client::new();
    let response = client
        .post(HKDIR_API_URL)
        .json(&request_body)
        .send()
        .await?;
    response.json::<Vec<HkdirGrade>>().await
}

pub fn map_season_index_to(index: &str) -> SubjectGradingSeason {
    match index {
        "0" => SubjectGradingSeason::Winter,
        "1" => SubjectGradingSeason::Spring,
        "2" => SubjectGradingSeason::Summer,
        "3" => SubjectGradingSeason::Autumn,
        x => panic!("attempted to parse invalid season {}", x),
    }
}
