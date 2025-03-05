import io
from datetime import datetime

import reportlab.lib.pagesizes as pagesizes
from reportlab.pdfgen import canvas

from core.pdf_combine import merge_attachments
from core.data_types import FormData


def get_current_date_string() -> str:
    """Get the current date as a string in ISO 8601 date format."""
    return datetime.now().strftime("%Y-%m-%d")


def format_amount(amount: float) -> str:
    """Format decimal amounts to 2 decimals, integers to 0 decimals."""
    if amount.is_integer():
        return f"{int(amount)}"
    return f"{amount:.2f}"


def create_table_document(form_data: FormData) -> bytes:
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

    # Handle multiline comments
    comments = str(form_data.comments)
    y_position = 800 - 320
    for line in comments.split("\n"):
        if y_position < 300:  # Prevent overflow
            break
        pdf.drawString(100, y_position, line)
        y_position -= 20

    pdf.save()
    buffer.seek(0)
    return buffer.read()


def pdf_generator(form: FormData) -> bytes:
    """Generate a PDF from the form data."""
    try:
        table = create_table_document(form)
        complete_pdf = merge_attachments(table, form.attachments)
        return complete_pdf
    except Exception as e:
        print(f"Error generating PDF: {str(e)}")
        raise
