use crate::json::HkdirDepartment;
use reqwest::Client;
use serde_json::{json, Value};

const HKDIR_API_URL: &str = "https://dbh.hkdir.no/api/Tabeller/hentJSONTabellData";

fn build_get_departments_request() -> Value {
    let json = json!({
        "tabell_id": 210,
        "api_versjon": 1,
        "statuslinje": "N",
        "kodetekst": "J",
        "desimal_separator": ".",
        "variabler": ["*"],
        "sortBy": ["Nivå"],
        "filter": [
            {
                "variabel": "Institusjonskode",
                "selection": {
                    "filter": "item",
                    "values": ["1150"],
                    "exclude": [""],
                },
            },
        ],
    });
    json
}

pub async fn get_departments() -> reqwest::Result<Vec<HkdirDepartment>> {
    let request_body = build_get_departments_request();
    let client = Client::new();
    let response = client
        .post(HKDIR_API_URL)
        .json(&request_body)
        .send()
        .await?;
    response.json::<Vec<HkdirDepartment>>().await
}
