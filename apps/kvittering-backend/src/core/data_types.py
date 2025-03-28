from dataclasses import dataclass
from datetime import datetime
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


@dataclass
class Attachment:
    """Attachment for the PDF generator."""

    url: str
    mime_type: str

    @classmethod
    def from_json(cls, json_data: Dict[str, Any]) -> "Attachment":
        return cls(url=json_data["url"], mime_type=json_data["mime_type"])

    def to_dict(self) -> Dict[str, Any]:
        """Convert the Attachment object to a dictionary."""
        return {"url": self.url, "mime_type": self.mime_type}


@dataclass
class FormData:
    """Form data for the PDF generator."""

    full_name: str
    email: str
    committee: str
    type: str
    card_number: str
    account: str
    amount: float
    intent: str
    comments: str
    attachments: List[Attachment]
    start_time: datetime | None

    @classmethod
    def from_json(cls, json_data: Dict[str, Any]) -> "FormData":
        required_fields = [
            "full_name",
            "email",
            "committee",
            "type",
            "amount",
            "intent",
        ]
        logger.info(f"Received JSON data: {json_data}")
        missing_fields = [field for field in required_fields if field not in json_data]
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")

        logger.info(f"Received JSON data: {json_data}")
        return cls(
            full_name=json_data.get("full_name", ""),
            email=json_data.get("email", ""),
            committee=json_data.get("committee", ""),
            type=json_data.get("type", ""),
            card_number=json_data.get("card_number", ""),
            account=json_data.get("account", ""),
            amount=float(json_data.get("amount", 0)),
            intent=json_data.get("intent", ""),
            comments=json_data.get("comments", ""),
            attachments=[
                Attachment(url=attachment["url"], mime_type=attachment["mime_type"])
                for attachment in json_data.get("attachments", [])
            ],
            start_time=datetime.fromisoformat(json_data.get("start_time")),
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert the FormData object to a dictionary."""
        return {
            "full_name": self.full_name,
            "email": self.email,
            "committee": self.committee,
            "type": self.type,
            "card_number": self.card_number,
            "account": self.account,
            "amount": self.amount,
            "intent": self.intent,
            "comments": self.comments,
            "attachments": self.attachments,
            "start_time": self.start_time,
        }


class AttachmentFactory:
    @staticmethod
    def create(
        url: str = "https://s3.eu-north-1.amazonaws.com/cdn.online.ntnu.no/1740758636592-d30xeaz5bcr-test.png",
        mime_type: str = "image/png",
    ) -> Attachment:
        return Attachment(url=url, mime_type=mime_type)


class FormDataFactory:
    @staticmethod
    def create(
        full_name: str = "Test Person",
        email: str = "test@example.com",
        committee: str = "Test Committee",
        type: str = "card",
        card_number: str = "1234567890",
        account: str = "1234567890",
        amount: float = 100.0,
        intent: str = "Test Intent",
        comments: str = "Test Comments",
        attachments: List[Attachment] | None = None,
        start_time=None,
    ) -> FormData:
        attachments = attachments or [AttachmentFactory.create()]
        return FormData(
            full_name=full_name,
            email=email,
            committee=committee,
            type=type,
            card_number=card_number,
            account=account,
            amount=amount,
            intent=intent,
            comments=comments,
            attachments=attachments,
            start_time=start_time,
        )
