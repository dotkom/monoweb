import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import Dict, Any, Union, List, Optional
import boto3
from core.data_types import FormData
from core.utils import get_current_date_string, format_amount

logger = logging.getLogger(__name__)


class EmailService:
    """Class for handling email sending operations."""

    def __init__(self, ses_client=None):
        """Initialize the EmailSender with an optional SES client.

        Args:
            ses_client: An AWS SES client. If None, a default client will be created.
        """
        self.ses_client = ses_client or self._create_default_ses_client()

    @staticmethod
    def _create_default_ses_client():
        """Create and return a default Amazon SES client."""
        try:
            return boto3.client("ses", region_name="eu-north-1")
        except Exception as e:
            logger.error(f"Failed to create SES client: {str(e)}")
            raise Exception(f"Could not initialize email service: {str(e)}")

    @staticmethod
    def get_formatted_text(form: FormData) -> str:
        """Format the email body text."""
        return f"""
Type: [{'Bankkort' if form.type == 'card' else 'Utlegg'}]

{form.full_name} har sendt inn skjema på {format_amount(form.amount)} kr for:
{form.intent}

Ekstra informasjon:
{form.comments}
"""

    @staticmethod
    def get_file_name(form: FormData) -> str:
        """Generate a filename for the PDF attachment."""
        return f"[{get_current_date_string()}]-{form.intent}-{format_amount(form.amount)}-kvitteringsskjema.pdf"

    def send_email(
        self,
        pdf_data: bytes,
        form_data: FormData,
        sender_email: str,
        recipient_email: str,
        cc_list: List[str],
    ) -> None:
        """Send an email with PDF attachment using Amazon SES.

        Args:
            pdf_data: The PDF data to attach
            form_data: The form data to include in the email
            sender_email: The email address of the sender
            recipient_email: The email address of the primary recipient
            cc_list: List of email addresses to CC
        """
        # Create message container
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = recipient_email

        # Add CC recipients
        msg["Cc"] = ", ".join(cc_list)

        # Set subject
        msg["Subject"] = (
            f"[{form_data.committee}] {form_data.intent} - {form_data.full_name}"
        )

        # Add body text
        msg.attach(MIMEText(self.get_formatted_text(form_data), "plain"))

        # Add PDF attachment
        attachment = MIMEApplication(pdf_data)
        attachment.add_header(
            "Content-Disposition",
            f'attachment; filename="{self.get_file_name(form_data)}"',
        )
        msg.attach(attachment)

        # Get the raw email message
        raw_message = msg.as_string()

        # All recipients for SES
        all_recipients = [recipient_email] + cc_list

        logger.info(f"""Preparing to send email via SES:
        From: {sender_email}
        To: {recipient_email}
        Cc: {', '.join(cc_list)}
        Subject: {msg['Subject']}
        """)

        # Send the email using SES
        response = self.ses_client.send_raw_email(
            Source=sender_email,
            Destinations=all_recipients,
            RawMessage={"Data": raw_message},
        )

        logger.info(
            f"Email sent successfully via SES to {recipient_email} with {len(cc_list)} CC recipients. Message ID: {response.get('MessageId')}"
        )
