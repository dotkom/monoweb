import json
import boto3
from datetime import datetime
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from core.pdf_table import pdf_generator
from core.data_types import FormData
from core.get_and_validate_env import get_and_validate_env
from core.send_email import send_email
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)

MAX_SIZE_MB = 25

@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Hello, world!"})

@app.route('/presigned_post', methods=['POST', 'OPTIONS'])
def presigned_post():
    """Generate a presigned POST URL for S3 file upload"""
    if request.method == 'OPTIONS':
        return jsonify({"message": "OK", "data": {}}), 200
    
    try:
        s3_client = boto3.client("s3")
        body = request.json
        key = body.get("key")
        mime_type = body.get("mime_type")
        env = get_and_validate_env()

        conditions = [
            ["content-length-range", 0, MAX_SIZE_MB * 1024 * 1024],
            ["starts-with", "$Content-Type", ""]
        ]

        presigned_post = s3_client.generate_presigned_post(
            Bucket=env["STORAGE_BUCKET"],
            Key=key,
            Conditions=conditions,
            ExpiresIn=3600,  # URL expires in 1 hour
        )

        return jsonify({"message": "Presigned post URL generated successfully", "data": presigned_post}), 200
    except Exception as e:
        return jsonify({"message": "Error", "data": {"error": str(e)}}), 500

@app.route('/generate_pdf', methods=['POST', 'OPTIONS'])
def generate_pdf():
    """Generate a PDF from form data"""
    if request.method == 'OPTIONS':
        return jsonify({"message": "OK", "data": {}}), 200
    
    try:
        s3_client = boto3.client("s3")
        body = request.json
        form_data_dict = body.get("form_data")
        env = get_and_validate_env()

        if not form_data_dict:
            return jsonify({"message": "Missing required parameter: form_data", "data": {}}), 400
        
        form_data = FormData.from_json(form_data_dict)
        pdf = pdf_generator(form_data)
        key = f"pdfs/{datetime.now().strftime('%Y-%m-%d')}-{uuid.uuid4()}.pdf"
        s3_client.put_object(Bucket=env["STORAGE_BUCKET"], Key=key, Body=pdf, ContentType="application/pdf")

        # create presigned url for pdf
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': env["STORAGE_BUCKET"],
                'Key': key
            },
            ExpiresIn=3600,
        )

        return jsonify({"message": "PDF generated successfully", "data": {"pdf_url": presigned_url}}), 200
    except Exception as e:
        return jsonify({"message": "Error", "data": {"error": str(e)}}), 500

@app.route('/send_email', methods=['POST', 'OPTIONS'])
def send_email_handler():
    """Send email with PDF attachment"""
    if request.method == 'OPTIONS':
        return jsonify({"message": "OK", "data": {}}), 200
    
    try:
        s3_client = boto3.client("s3")
        body = request.json
        env = get_and_validate_env()

        if env["EMAIL_ENABLED"] == "false":
            return jsonify({"message": "Email is disabled", "data": {}}), 200

        pdf_url = body.get("pdf_url")
        form_data_dict = body.get("form_data")
        form_data = FormData.from_json(form_data_dict)

        # Extract the key from the S3 URL
        parsed_url = urlparse(pdf_url)
        key = parsed_url.path.lstrip('/')  # Remove leading slash
        s3_response = s3_client.get_object(Bucket=env["STORAGE_BUCKET"], Key=key)
        pdf_data = s3_response['Body'].read()

        send_email(pdf_data, form_data, env["SENDER_EMAIL"], env["RECIPIENT_EMAIL"], env["CC_RECIPIENT_EMAILS"])

        return jsonify({"message": "PDF sent successfully", "data": {}}), 200
    except Exception as e:
        return jsonify({"message": "Error", "data": {"error": str(e)}}), 500

# For backward compatibility (optional)
@app.route('/api/kvittering', methods=['POST', 'OPTIONS'])
def kvittering_handler():
    """Legacy handler that redirects to the appropriate endpoint"""
    if request.method == 'OPTIONS':
        return jsonify({"message": "OK", "data": {}}), 200
    
    try:
        body = request.json
        route = body.get("route")
        
        if route == "presigned_post":
            return presigned_post()
        elif route == "generate_pdf":
            return generate_pdf()
        elif route == "send_email":
            return send_email_handler()
        else:
            return jsonify({"message": f"Invalid route: {route}", "data": {}}), 400
    except Exception as e:
        return jsonify({"message": "Error", "data": {"error": str(e)}}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)