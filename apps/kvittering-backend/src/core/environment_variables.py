import os
from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class Env:
    # REQUIRED
    ENVIRONMENT: str
    STORAGE_BUCKET: str
    EMAIL_ENABLED: bool

    # Optional
    AWS_REGION: str = "eu-north-1"

    # Required if EMAIL_ENABLED
    SENDER_EMAIL: Optional[str] = ""
    RECIPIENT_EMAIL: Optional[str] = ""
    CC_RECIPIENT_EMAILS: List[str] = field(default_factory=list)

    # We don't have a staging environment, so we use these 
    # for testing if deployment works (kvitterin.onn/test uses these)
    TEST_SENDER_EMAIL: Optional[str] = ""
    TEST_RECIPIENT_EMAIL: Optional[str] = ""
    TEST_CC_RECIPIENT_EMAILS: List[str] = field(default_factory=list)

    def to_dict(self):
        return {
            "ENVIRONMENT": self.ENVIRONMENT,
            "STORAGE_BUCKET": self.STORAGE_BUCKET,

            "EMAIL_ENABLED": self.EMAIL_ENABLED,

            "SENDER_EMAIL": self.SENDER_EMAIL,
            "RECIPIENT_EMAIL": self.RECIPIENT_EMAIL,
            "CC_RECIPIENT_EMAILS": self.CC_RECIPIENT_EMAILS,

            "TEST_SENDER_EMAIL": self.TEST_SENDER_EMAIL,
            "TEST_RECIPIENT_EMAIL": self.TEST_RECIPIENT_EMAIL,
            "TEST_CC_RECIPIENT_EMAILS": self.TEST_CC_RECIPIENT_EMAILS,

            "AWS_REGION": self.AWS_REGION,
        }

    @classmethod
    def load_env(cls):
        env = {}
        # --- Required to run application---
        env["ENVIRONMENT"] = os.environ.get("ENVIRONMENT", "").lower()
        env["STORAGE_BUCKET"] = os.environ.get("STORAGE_BUCKET", "").strip()
        env["EMAIL_ENABLED"] = os.environ.get("EMAIL_ENABLED", "true").strip()

        # --- With default values ---
        env["AWS_REGION"] = os.environ.get("AWS_REGION", "eu-north-1")

        if env["ENVIRONMENT"] not in ["dev", "prod"]:
            raise ValueError("ENVIRONMENT must be 'dev' or 'prod'")

        # --- Validate env ---
        if env["EMAIL_ENABLED"] not in ["true", "false"]:
            raise ValueError("EMAIL_ENABLED must be 'true' or 'false'")

        if not env["STORAGE_BUCKET"]:
            raise ValueError("STORAGE_BUCKET missing or empty")

        # Convert string to boolean early for clearer logic
        env["EMAIL_ENABLED"] = env["EMAIL_ENABLED"] == "true"

        if env["EMAIL_ENABLED"]:
            env["SENDER_EMAIL"] = os.environ.get("SENDER_EMAIL", "").strip()
            env["RECIPIENT_EMAIL"] = os.environ.get("RECIPIENT_EMAIL", "").strip()
            env["CC_RECIPIENT_EMAILS"] = [
                email.strip()
                for email in os.environ.get("CC_RECIPIENT_EMAILS", "").split(",")
                if email.strip()
            ]


            if not env["SENDER_EMAIL"] or "@" not in env["SENDER_EMAIL"]:
                raise ValueError("SENDER_EMAIL missing or invalid")
            if not env["RECIPIENT_EMAIL"] or "@" not in env["RECIPIENT_EMAIL"]:
                raise ValueError("RECIPIENT_EMAIL missing or invalid")
            
            # Validate CC emails if any are provided
            for email in env["CC_RECIPIENT_EMAILS"]:
                if "@" not in email:
                    raise ValueError(f"Invalid CC email address: {email}")

            env["TEST_SENDER_EMAIL"] = os.environ.get("TEST_SENDER_EMAIL", "").strip()
            env["TEST_RECIPIENT_EMAIL"] = os.environ.get("TEST_RECIPIENT_EMAIL", "").strip()
            env["TEST_CC_RECIPIENT_EMAILS"] = [
                email.strip()
                for email in os.environ.get("TEST_CC_RECIPIENT_EMAILS", "").split(",")
                if email.strip()
            ]
            
            # Validate test emails if they are provided
            if env["TEST_SENDER_EMAIL"] and "@" not in env["TEST_SENDER_EMAIL"]:
                raise ValueError("TEST_SENDER_EMAIL is invalid")
            if env["TEST_RECIPIENT_EMAIL"] and "@" not in env["TEST_RECIPIENT_EMAIL"]:
                raise ValueError("TEST_RECIPIENT_EMAIL is invalid")
            for email in env["TEST_CC_RECIPIENT_EMAILS"]:
                if "@" not in email:
                    raise ValueError(f"Invalid TEST_CC email address: {email}")
        
        # Return instance of Env class instead of dict
        return cls(
            ENVIRONMENT=env["ENVIRONMENT"],
            STORAGE_BUCKET=env["STORAGE_BUCKET"],
            EMAIL_ENABLED=env["EMAIL_ENABLED"],
            AWS_REGION=env["AWS_REGION"],
            SENDER_EMAIL=env.get("SENDER_EMAIL", ""),
            RECIPIENT_EMAIL=env.get("RECIPIENT_EMAIL", ""),
            CC_RECIPIENT_EMAILS=env.get("CC_RECIPIENT_EMAILS", []),
            TEST_SENDER_EMAIL=env.get("TEST_SENDER_EMAIL", ""),
            TEST_RECIPIENT_EMAIL=env.get("TEST_RECIPIENT_EMAIL", ""),
            TEST_CC_RECIPIENT_EMAILS=env.get("TEST_CC_RECIPIENT_EMAILS", []),
        )
