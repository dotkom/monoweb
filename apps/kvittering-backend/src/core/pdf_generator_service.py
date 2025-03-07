import io

import reportlab.lib.pagesizes as pagesizes
from reportlab.pdfgen import canvas

from core.data_types import FormData
from core.utils import (
    get_current_date_string,
    format_amount,
    extract_s3_key_from_url,
    append_images_to_pdf,
)


class PdfGeneratorService:
    """Service for creating PDF tables and documents from form data."""

    def __init__(self, s3_client=None, env=None):
        """Initialize the PdfGeneratorService with optional dependency injection."""
        self.s3_client = s3_client
        self.env = env

    def _create_table_document(self, form_data: FormData) -> bytes:
        """Create a PDF document with a table of receipt information."""
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=pagesizes.A4)

        # Set up the document
        pdf.setFont("Helvetica-Bold", 25)
        pdf.drawString(100, 800 - 80, "Kvitteringsskjema")

        # Helper function to create table rows
        def create_table_row(height: int, label: str, value: str):
            pdf.setFont("Helvetica-Bold", 14)
            pdf.drawString(100, 800 - height, label)
            pdf.setFont("Helvetica", 14)
            pdf.drawString(220, 800 - height, value)

        # Add table rows
        create_table_row(120, "Navn: ", str(form_data.full_name))
        create_table_row(140, "Epost: ", str(form_data.email))
        create_table_row(160, "Ansvarlig enhet: ", str(form_data.committee))
        create_table_row(180, "Dato: ", get_current_date_string())

        if form_data.type == "card":
            create_table_row(200, "Kontonummer: ", str(form_data.card_number))
        else:
            create_table_row(200, "Kontonummer: ", str(form_data.account))

        create_table_row(220, "Beløp: ", format_amount(form_data.amount))
        create_table_row(240, "Anledning: ", str(form_data.intent))
        create_table_row(
            260, "Type: ", "Bankkort" if form_data.type == "card" else "Utlegg"
        )

        # Add comments
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(100, 800 - 300, "Kommentar")
        pdf.setFont("Helvetica", 14)

        # Handle multiline comments with simple character limit
        comments = str(form_data.comments)
        y_position = 800 - 320
        char_limit = 40  # Character limit per line

        # Split by explicit newlines first
        for paragraph in comments.split("\n"):
            # Split long lines at approximately char_limit characters
            i = 0
            while i < len(paragraph):
                line = paragraph[i : i + char_limit]
                if y_position < 100:  # Prevent overflow at bottom of page
                    break
                pdf.drawString(100, y_position, line)
                y_position -= 20
                i += char_limit

            # Add an extra line break between paragraphs
            y_position -= 5

            if y_position < 100:  # Check if we've run out of space
                break

        pdf.save()
        buffer.seek(0)
        return buffer.read()

    def _get_image_from_s3(self, attachment_url: str) -> bytes:
        """Get an image from S3."""
        key = extract_s3_key_from_url(attachment_url)
        response = self.s3_client.get_object(Bucket=self.env["STORAGE_BUCKET"], Key=key)
        return response["Body"].read()

    def generate_pdf_from_form(self, form: FormData) -> bytes:
        """Generate a PDF from the form data."""
        try:
            table = self._create_table_document(form)
            images = [
                self._get_image_from_s3(attachment.url)
                for attachment in form.attachments
            ]
            complete_pdf = append_images_to_pdf(table, images)
            return complete_pdf
        except Exception as e:
            print(f"Error generating PDF: {str(e)}")
            raise
