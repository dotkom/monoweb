import os

def get_and_validate_env():
    email_config = {
        "EMAIL_ENABLED": os.environ.get("EMAIL_ENABLED", "true").strip(),
        "STORAGE_BUCKET": os.environ.get("STORAGE_BUCKET", "").strip(),
    }

    if not email_config["EMAIL_ENABLED"] in ["true", "false"]:
        raise ValueError("EMAIL_ENABLED must be 'true' or 'false'")

    if email_config["EMAIL_ENABLED"] == "true":
        email_config["SENDER_EMAIL"] = os.environ.get("SENDER_EMAIL", "").strip()
        email_config["RECIPIENT_EMAIL"]= os.environ.get("RECIPIENT_EMAIL", "").strip()
        email_config["CC_RECIPIENT_EMAILS"]= [email.strip() for email in os.environ.get("CC_RECIPIENT_EMAILS", "").split(",") if email.strip()]

        if not email_config["SENDER_EMAIL"] or "@" not in email_config["SENDER_EMAIL"]:
            raise ValueError("SENDER_EMAIL missing or invalid")
        if not email_config["RECIPIENT_EMAIL"] or "@" not in email_config["RECIPIENT_EMAIL"]:
            raise ValueError("RECIPIENT_EMAIL missing or invalid")
        if not email_config["CC_RECIPIENT_EMAILS"]:
            raise ValueError("CC_RECIPIENT_EMAILS missing or empty")


    if not email_config["STORAGE_BUCKET"]:
        raise ValueError("STORAGE_BUCKET missing or empty")

    return email_config
