use crate::json::{HkdirDepartment, HkdirSubject};
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
            {
                "variabel": "Avdelingskode",
                "selection": {
                    "filter": "all",
                    "values": ["*"],
                    "exclude": ["000000"],
                },
            },
        ],
    });
    json
}

fn build_get_subjects_request() -> Value {
    let json = json!({
        "tabell_id": 208,
        "api_versjon": 1,
        "statuslinje": "N",
        "kodetekst": "J",
        "desimal_separator": ".",
        "variabler": ["*"],
        "sortBy": ["Årstall", "Institusjonskode", "Avdelingskode"],
        "filter": [
            {
                "variabel": "Institusjonskode",
                "selection": {
                    "filter": "item",
                    "values": ["1150"],
                    "exclude": [""],
                },
            },
            {
                "variabel": "Nivåkode",
                "selection": {
                    "filter": "item",
                    "values": ["HN", "LN"],
                    "exclude": [""],
                },
            },
            {
                "variabel": "Status",
                "selection": {
                    "filter": "item",
                    "values": ["1", "2"],
                    "exclude": [""],
                },
            },
            {
                "variabel": "Avdelingskode",
                "selection": {
                    "filter": "all",
                    "values": ["*"],
                    "exclude": ["000000"],
                },
            },
            {
                "variabel": "Oppgave (ny fra h2012)",
                "selection": {
                    "filter": "all",
                    "values": ["*"],
                    "exclude": ["1", "2"],
                },
            },
            {
                "variabel": "Årstall",
                "selection": {
                    "filter": "top",
                    "values": ["5"],
                    "exclude": [""],
                },
            }
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

pub async fn get_subjects() -> reqwest::Result<Vec<HkdirSubject>> {
    let request_body = build_get_subjects_request();
    let client = Client::new();
    let response = client
        .post(HKDIR_API_URL)
        .json(&request_body)
        .send()
        .await?;
    response.json::<Vec<HkdirSubject>>().await
}
