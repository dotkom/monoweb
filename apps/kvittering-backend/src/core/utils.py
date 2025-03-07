from urllib.parse import urlparse

import io
from typing import Dict, List, Any, Optional
import boto3

import reportlab.lib.pagesizes as pagesizes
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from PyPDF2 import PdfReader, PdfWriter

from datetime import datetime


def extract_s3_key_from_url(url: str) -> str:
    """
    Extract the S3 key from an S3 URL.

    Example:
    Input: "https://s3.eu-north-1.amazonaws.com/receipt-archive.online.ntnu.no/bilde.png"
    Output: "bilde.png"

    Args:
        url: The S3 URL to extract the key from

    Returns:
        The S3 key (path after bucket name)
    """
    parsed = urlparse(url)
    # Remove leading slash if present
    path = parsed.path.lstrip("/")
    # Split at first slash to separate bucket from key
    _, key = path.split("/", 1)
    return key


def get_current_date_string() -> str:
    """Get the current date as a string in ISO 8601 date format."""
    return datetime.now().strftime("%Y-%m-%d")


def format_amount(amount: float) -> str:
    """Format decimal amounts to 2 decimals, integers to 0 decimals."""
    if amount.is_integer():
        return f"{int(amount)}"
    return f"{amount:.2f}"


def _image_to_pdf(img_bytes: bytes) -> PdfReader:
    """Process an image (JPEG or PNG) and convert it to a PDF page."""
    # Create a new PDF with the image
    img_buffer = io.BytesIO()
    img_pdf = canvas.Canvas(img_buffer, pagesize=pagesizes.A4)

    img = ImageReader(io.BytesIO(img_bytes))

    # Calculate dimensions to fit on A4
    width, height = img.getSize()
    page_width, page_height = pagesizes.A4

    # Scale to fit page
    scale = min(page_width / width, page_height / height)
    new_width = width * scale
    new_height = height * scale

    # Center on page
    x = (page_width - new_width) / 2
    y = (page_height - new_height) / 2

    img_pdf.drawImage(img, x, y, width=new_width, height=new_height)
    img_pdf.save()

    img_buffer.seek(0)
    return PdfReader(img_buffer)


def append_images_to_pdf(pdf_data: bytes, images_to_append: List[bytes]) -> bytes:
    """Merge attachments with the main PDF."""
    # Create PDF writer for the output
    output_pdf = PdfWriter()

    # Add the front page
    front_page = PdfReader(io.BytesIO(pdf_data))
    output_pdf.add_page(front_page.pages[0])

    # Process each attachment
    for img_bytes in images_to_append:
        img_page = _image_to_pdf(img_bytes)
        output_pdf.add_page(img_page.pages[0])

    # Save the complete PDF
    output_buffer = io.BytesIO()
    output_pdf.write(output_buffer)
    output_buffer.seek(0)
    return output_buffer.read()
