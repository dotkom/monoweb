# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "pypdf2",
#     "pytest",
#     "reportlab",
#     "requests",
# ]
# ///

import io
import unittest
from typing import Dict, Any
from pathlib import Path

from PyPDF2 import PdfReader

from pdf_table import (
    pdf_generator,
    create_table_document,
    merge_attachments,
    PdfRenderError,
    get_current_date_string,
    format_amount,
    get_group_name,
)

ATTACHMENT_1 = "https://s3.eu-north-1.amazonaws.com/cdn.online.ntnu.no/1740758636592-d30xeaz5bcr-test.png"


def create_test_form() -> Dict[str, Any]:
    """Create a test form with all required fields."""
    return {
        "full_name": "Test Person",
        "email": "test@example.com",
        "committee": "Test Committee",
        "type": "card",
        "card_details": "1234 5678 9012 3456",
        "account": "",
        "amount": 123.45,
        "intent": "Test Purchase",
        "comments": "This is a test comment\nWith multiple lines",
        "attachments": [
            {"filename": "test.png", "mime_type": "image/png", "url": ATTACHMENT_1}
        ],
    }


def create_test_image_attachment(mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """Create a test image attachment."""
    # Simple 1x1 pixel image
    if mime_type == "image/jpeg":
        # Base64 encoded 1x1 JPEG
        data = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q=="
    else:
        # Base64 encoded 1x1 PNG
        data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

    return {"name": f"test.{mime_type.split('/')[1]}", "type": mime_type, "data": data}


def create_test_pdf_attachment() -> Dict[str, Any]:
    """Create a test PDF attachment."""
    # This is a minimal valid PDF
    data = "data:application/pdf;base64,JVBERi0xLjAKMSAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1syIDAgUl0+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDEgMCBSL01lZGlhQm94WzAgMCAzIDNdPj4KZW5kb2JqCjMgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDEgMCBSPj4KZW5kb2JqCnRyYWlsZXIKPDwvUm9vdCAzIDAgUj4+CiUlRU9G"

    return {"name": "test.pdf", "type": "application/pdf", "data": data}


def ensure_output_dir():
    """Ensure the output directory exists."""
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    return output_dir


def write_pdf_to_output(pdf_data: bytes, filename: str):
    """Write PDF data to the output directory."""
    output_dir = ensure_output_dir()
    output_path = output_dir / filename

    with open(output_path, "wb") as f:
        f.write(pdf_data)

    print(f"PDF written to {output_path}")


class TestPdf(unittest.TestCase):
    """Test the PDF generation functionality."""

    def test_get_current_date_string(self):
        """Test the get_current_date_string function."""
        date_string = get_current_date_string()
        # Check format YYYY-MM-DD
        self.assertRegex(date_string, r"^\d{4}-\d{2}-\d{2}$")

    def test_format_amount(self):
        """Test the format_amount function."""
        # Integer amount
        self.assertEqual(format_amount(100.0), "100")
        # Decimal amount
        self.assertEqual(format_amount(123.45), "123.45")
        # Single decimal
        self.assertEqual(format_amount(123.4), "123.40")

    def test_get_group_name(self):
        """Test the get_group_name function."""
        # Online group
        online_group = {"name_long": "Online Group", "created": "2023-01-01"}
        self.assertEqual(get_group_name(online_group), "Online Group")

        # Extra group
        extra_group = {"name": "Extra Group"}
        self.assertEqual(get_group_name(extra_group), "Extra Group")

    def test_create_table_document(self):
        """Test the create_table_document function."""
        form = create_test_form()
        pdf_data = create_table_document(form)

        # Check that we got valid PDF data
        self.assertTrue(pdf_data.startswith(b"%PDF"))

        # Check that we can read it with PyPDF2
        pdf = PdfReader(io.BytesIO(pdf_data))
        self.assertEqual(len(pdf.pages), 1)

        # Write to output directory
        write_pdf_to_output(pdf_data, "table_document.pdf")

    def test_merge_attachments_no_attachments(self):
        """Test merging with no attachments."""
        form = create_test_form()
        table_pdf = create_table_document(form)

        merged_pdf = merge_attachments(table_pdf, [])

        # Check that we got valid PDF data
        self.assertTrue(merged_pdf.startswith(b"%PDF"))

        # Check that we have only one page (the table)
        pdf = PdfReader(io.BytesIO(merged_pdf))
        self.assertEqual(len(pdf.pages), 1)

        # Write to output directory
        write_pdf_to_output(merged_pdf, "merged_no_attachments.pdf")

    def test_merge_attachments_with_jpeg(self):
        """Test merging with a JPEG attachment."""
        form = create_test_form()
        # form["attachments"] = [create_test_image_attachment("image/jpeg")]

        table_pdf = create_table_document(form)
        merged_pdf = merge_attachments(table_pdf, form["attachments"])

        # Check that we got valid PDF data
        self.assertTrue(merged_pdf.startswith(b"%PDF"))

        # Check that we have two pages (table + attachment)
        pdf = PdfReader(io.BytesIO(merged_pdf))
        self.assertEqual(len(pdf.pages), 2)

        # Write to output directory
        write_pdf_to_output(merged_pdf, "merged_with_jpeg.pdf")

    def test_merge_attachments_with_png(self):
        """Test merging with a PNG attachment."""
        form = create_test_form()
        # form["attachments"] = [create_test_image_attachment("image/png")]

        table_pdf = create_table_document(form)
        merged_pdf = merge_attachments(table_pdf, form["attachments"])

        # Check that we got valid PDF data
        self.assertTrue(merged_pdf.startswith(b"%PDF"))

        # Check that we have two pages (table + attachment)
        pdf = PdfReader(io.BytesIO(merged_pdf))
        self.assertEqual(len(pdf.pages), 2)

        # Write to output directory
        write_pdf_to_output(merged_pdf, "merged_with_png.pdf")

    def test_merge_attachments_with_multiple_images(self):
        """Test merging with multiple image attachments."""
        form = create_test_form()
        form["attachments"] = [
            # create_test_image_attachment("image/jpeg"),
            # create_test_image_attachment("image/png")
        ]

        table_pdf = create_table_document(form)
        merged_pdf = merge_attachments(table_pdf, form["attachments"])

        # Check that we got valid PDF data
        self.assertTrue(merged_pdf.startswith(b"%PDF"))

        # Check that we have three pages (table + 2 attachments)
        pdf = PdfReader(io.BytesIO(merged_pdf))
        self.assertEqual(len(pdf.pages), 3)

        # Write to output directory
        write_pdf_to_output(merged_pdf, "merged_with_multiple_images.pdf")

    def test_pdf_generator_success(self):
        """Test successful PDF generation."""
        form = create_test_form()
        form["attachments"] = [
            # create_test_image_attachment("image/jpeg"),
            # create_test_image_attachment("image/png")
        ]

        pdf_data = pdf_generator(form)

        # Check that we got valid PDF data
        self.assertTrue(pdf_data.startswith(b"%PDF"))

        # Check that we have three pages (table + 2 attachments)
        pdf = PdfReader(io.BytesIO(pdf_data))
        self.assertEqual(len(pdf.pages), 3)

        # Write to output directory
        write_pdf_to_output(pdf_data, "complete_pdf.pdf")

    def test_pdf_generator_with_invalid_form(self):
        """Test PDF generation with an invalid form."""
        # Missing required field
        form = create_test_form()
        del form["fullname"]

        with self.assertRaises(PdfRenderError):
            pdf_generator(form)


if __name__ == "__main__":
    suite = unittest.TestSuite()
    suite.addTest(TestPdf("test_merge_attachments_with_png"))
    unittest.TextTestRunner().run(suite)
