import json
import boto3
from datetime import datetime
import uuid
from core.pdf_table import pdf_generator
from core.data_types import FormData
from core.get_and_validate_env import get_and_validate_env
from core.send_email import send_email
from urllib.parse import urlparse

MAX_SIZE_MB = 25

def response(message, data={}, status_code=200):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        },
        "body": json.dumps(
            {"message": message, "data": data}
        ),
        }

def handler(event, context):
    try:
        s3_client = boto3.client("s3")
        body = json.loads(event["body"])
        route = body.get("route")
        env = get_and_validate_env()

        if "OPTIONS" in event['routeKey']:
            return response(message="OK", data={}, status_code=200)

        if "POST" in event['routeKey']:
            if route == "presigned_post":
                key = body.get("key")
                mime_type = body.get("mime_type")

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

                return response(
                    message="Presigned post URL generated successfully",
                    data=presigned_post,
                    status_code=200,
                )

            if route == "generate_pdf":
                form_data_dict = body.get("form_data")

                if not form_data_dict:
                    return response(
                        message="Missing required parameter: form_data",
                        data={},
                        status_code=400,
                    )
                
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

                return response(
                    message="PDF generated successfully",
                    data={"pdf_url": presigned_url},
                    status_code=200,
                )

            if route == "send_email":
                if env["EMAIL_ENABLED"] == "false":
                    return response(
                        message="Email is disabled",
                        data={},
                        status_code=200,
                    )

                pdf_url = body.get("pdf_url")
                form_data_dict = body.get("form_data")
                form_data = FormData.from_json(form_data_dict)

                # Extract the key from the S3 URL
                parsed_url = urlparse(pdf_url)
                key = parsed_url.path.lstrip('/')  # Remove leading slash
                s3_response = s3_client.get_object(Bucket=env["STORAGE_BUCKET"], Key=key)
                pdf_data = s3_response['Body'].read()

                send_email(pdf_data, form_data, env["SENDER_EMAIL"], env["RECIPIENT_EMAIL"], env["CC_RECIPIENT_EMAILS"])

                return response(
                    message="PDF sent successfully",
                    data={},
                    status_code=200,
                )

            return response(
                message=f"Invalid route: {route}",
                data={},
                status_code=400,
            )

    except Exception as e:
        return response(
            message="Error",
            data={"error": str(e)},
            status_code=500,
        )
