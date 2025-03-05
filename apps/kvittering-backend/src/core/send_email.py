import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import Dict, Any, Union, List
from datetime import datetime
import boto3
from core.pdf_table import format_amount
from core.data_types import FormData

logger = logging.getLogger(__name__)

def get_current_date_string() -> str:
    """Get the current date as a string in ISO 8601 date format."""
    return datetime.now().strftime("%Y-%m-%d")


def get_group_name(committee: Dict[str, Any]) -> str:
    """Get the name of a group/committee."""
    if isinstance(committee, dict):
        if "created" in committee:  # Online group
            return committee.get("name_long", "")
        else:  # Extra group
            return committee.get("name", "")
    return str(committee)  # Fallback


def get_formatted_text(form: FormData) -> str:
    """Format the email body text."""
    return f"""
Type: [{'Bankkort' if form.type == 'card' else 'Utlegg'}]

{form.full_name} har sendt inn skjema på {format_amount(form.amount)} kr for:
{form.intent}

Ekstra informasjon:
{form.comments}
"""


def get_file_name(form: FormData) -> str:
    """Generate a filename for the PDF attachment."""
    return f"[{get_current_date_string()}]-{form.intent}-{format_amount(form.amount)}-kvitteringsskjema.pdf"


def create_ses_client():
    """Create and return an Amazon SES client."""
    try:
        client = boto3.client('ses')
        return client
    except Exception as e:
        logger.error(f"Failed to create SES client: {str(e)}")
        raise Exception(f"Could not initialize email service: {str(e)}")


def send_email(pdf_data: bytes, form_data: FormData, sender_email: str, recipient_email: str, cc_list: List[str]) -> None:
    # Create message container
    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = recipient_email

    # Add CC recipients
    msg["Cc"] = ", ".join(cc_list)

    # Set subject
    msg["Subject"] = (
        f"[{get_group_name(form_data.committee)}] {form_data.intent} - {form_data.full_name}"
    )

    # Add body text
    msg.attach(MIMEText(get_formatted_text(form_data), "plain"))

    # Add PDF attachment
    attachment = MIMEApplication(pdf_data)
    attachment.add_header(
        "Content-Disposition", f'attachment; filename="{get_file_name(form_data)}"'
    )
    msg.attach(attachment)

    # Get the raw email message
    raw_message = msg.as_string()

    # Create SES client
    ses_client = create_ses_client()
    
    # All recipients for SES
    all_recipients = [recipient_email] + cc_list
    
    logger.info(f"""Preparing to send email via SES:
    From: {sender_email}
    To: {recipient_email}
    Cc: {', '.join(cc_list)}
    Subject: {msg['Subject']}
    """)
    
    # Send the email using SES
    response = ses_client.send_raw_email(
        Source=sender_email,
        Destinations=all_recipients,
        RawMessage={
            'Data': raw_message
        }
    )
    
    logger.info(
        f"Email sent successfully via SES to {recipient_email} with {len(cc_list)} CC recipients. Message ID: {response.get('MessageId')}"
    )