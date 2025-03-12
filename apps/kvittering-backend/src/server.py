import boto3
from datetime import datetime
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from core.pdf_generator_service import PdfGeneratorService
from core.data_types import FormData
from core.environment_variables import Env
from core.email_service import EmailService
from core.utils import extract_s3_key_from_url
from botocore.config import Config
import sentry_sdk
import secrets
from dotenv import load_dotenv

load_dotenv()

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

env = Env.load_env()

IS_PRODUCTION = env.ENVIRONMENT == "prod"

sentry_sdk.init(
    # not sensitive so its ok to hardcode for now
    dsn="https://ce333be780ecceb0975d83342bacedba@o93837.ingest.us.sentry.io/4508931842048000"
    if IS_PRODUCTION
    else None,
    send_default_pii=True,
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
)

logger.info(f"Running in {env.ENVIRONMENT} mode")

PORT = 5000

app = Flask(__name__)
CORS(app)


s3_client = boto3.client(
    "s3", region_name=env.AWS_REGION, config=Config(signature_version="s3v4")
)
ses_client = boto3.client("ses", region_name=env.AWS_REGION)

pdf_generator_service = PdfGeneratorService(s3_client=s3_client, env=env)

email_service = EmailService(ses_client=ses_client)

MAX_SIZE_MB = 25

# hei1iiiiiii
curr = 0


@app.route("/counter")
def counter():
    global curr
    curr += 1
    return jsonify({"message": f"Counter: {curr}"})


@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Hello, world! :)"})


@app.route("/error", methods=["GET"])
def error():
    raise Exception("This is a test error")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"message": "OK"})


@app.route("/generate_presigned_post", methods=["POST", "OPTIONS"])
def generate_presigned_post():
    """Generate a presigned POST URL for S3 file upload"""
    if request.method == "OPTIONS":
        return jsonify({"message": "OK", "data": {}}), 200

    try:
        body = request.json
        key = body.get("key")

        conditions = [
            ["content-length-range", 0, MAX_SIZE_MB * 1024 * 1024],
            ["starts-with", "$Content-Type", ""],
        ]

        generated_key = secrets.token_hex(8) + "-" + key

        logger.info(f"Generating presigned post for {generated_key}")

        presigned_post = s3_client.generate_presigned_post(
            Bucket=env.STORAGE_BUCKET,
            Key=generated_key,
            Conditions=conditions,
            ExpiresIn=3600,
        )

        return jsonify(
            {
                "message": "Presigned post URL generated successfully",
                "data": presigned_post,
            }
        ), 200
    except Exception as e:
        return jsonify({"message": "Error", "data": {"error": str(e)}}), 500


@app.route("/generate_pdf", methods=["POST", "OPTIONS"])
def generate_pdf():
    """Generate a PDF from form data"""
    if request.method == "OPTIONS":
        return jsonify({"message": "OK", "data": {}}), 200

    try:
        body = request.json
        form_data_dict = body.get("form_data")

        if not form_data_dict:
            return jsonify(
                {"message": "Missing required parameter: form_data", "data": {}}
            ), 400

        form_data = FormData.from_json(form_data_dict)
        pdf = pdf_generator_service.generate_pdf_from_form(form_data)
        key = f"pdfs/{datetime.now().strftime('%Y-%m-%d')}-{uuid.uuid4()}.pdf"
        s3_client.put_object(
            Bucket=env.STORAGE_BUCKET,
            Key=key,
            Body=pdf,
            ContentType="application/pdf",
        )

        # create presigned url for pdf
        presigned_url = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": env.STORAGE_BUCKET, "Key": key},
            ExpiresIn=3600,
        )

        return jsonify(
            {
                "message": "PDF generated successfully",
                "data": {"pdf_url": presigned_url},
            }
        ), 200
    except Exception as e:
        return jsonify({"message": "Error", "data": {"error": str(e)}}), 500


@app.route("/send_email", methods=["POST", "OPTIONS"])
def send_email():
    """Send email with PDF attachment"""
    if request.method == "OPTIONS":
        return jsonify({"message": "OK", "data": {}}), 200

    try:
        body = request.json

        if not env.EMAIL_ENABLED:
            return jsonify({"message": "Email is disabled", "data": {}}), 200

        pdf_url = body.get("pdf_url")
        form_data_dict = body.get("form_data")
        form_data = FormData.from_json(form_data_dict)

        logger.info(
            f"PDF URL: {pdf_url}, Form data: {form_data}, Sender: {env.SENDER_EMAIL}, Recipient: {env.RECIPIENT_EMAIL}, CC: {env.CC_RECIPIENT_EMAILS}"
        )

        # Extract the key from the S3 URL
        pdf_key = extract_s3_key_from_url(pdf_url)
        s3_response = s3_client.get_object(Bucket=env.STORAGE_BUCKET, Key=pdf_key)
        pdf_data = s3_response["Body"].read()

        test_mode = body.get("test_mode", "false")
        sender_email = env.SENDER_EMAIL
        recipient_email = env.RECIPIENT_EMAIL
        cc_recipient_emails = env.CC_RECIPIENT_EMAILS

        if test_mode == "true":
            sender_email = env.TEST_SENDER_EMAIL
            recipient_email = env.TEST_RECIPIENT_EMAIL
            cc_recipient_emails = env.TEST_CC_RECIPIENT_EMAILS

        email_service.send_email(
            pdf_data,
            form_data,
            sender_email,
            recipient_email,
            cc_recipient_emails,
        )

        return jsonify({"message": "PDF sent successfully", "data": {}}), 200
    except Exception as e:
        sentry_sdk.capture_exception(e)
        logger.error(f"Error sending email: {str(e)}", exc_info=True)
        return jsonify({"message": "Error", "data": {"error": str(e)}}), 500


if __name__ == "__main__":
    app.run(debug=not IS_PRODUCTION, host="0.0.0.0", port=PORT)
