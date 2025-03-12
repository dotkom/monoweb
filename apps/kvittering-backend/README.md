**TLDR:**
- `just run` to run locally with docker
- AWS credentials a few env vars required. See src/core/environment_variables.py for details.
- `uv run src/server.py` to run locally without docker

# Kvittering Backend

A Flask-based backend service for generating and emailing PDF receipts.

## Requirements

- Python 3.12
- Docker
- [Just](https://github.com/casey/just) command runner (optional, for convenience commands)
- AWS credentials with access to S3 and SES

## Quick Start

### Running with Docker

```bash
just run
```

This builds and runs the application in a Docker container with development settings.

### Manual Setup

1. Install dependencies using [uv](https://github.com/astral-sh/uv):
   ```bash
   uv sync
   ```

2. Run the server:
   ```bash
   ENVIRONMENT=dev STORAGE_BUCKET=your-bucket EMAIL_ENABLED=false uv run src/server.py
   ```

## Environment Variables

Key environment variables:
- `ENVIRONMENT`: Set to `dev` or `prod` (default: `prod`)
- `STORAGE_BUCKET`: S3 bucket for storing PDFs
- `EMAIL_ENABLED`: Enable/disable email functionality
- `SENDER_EMAIL`: Email sender address (required when emails enabled)
- `RECIPIENT_EMAIL`: Primary recipient email (required when emails enabled)
- `CC_RECIPIENT_EMAILS`: CC recipients (optional)
- `AWS_REGION`: AWS region (default: `eu-north-1`)

See `src/core/environment_variables.py` for all required environment variables.

## API Endpoints

- `GET /`: Health check
- `GET /health`: Health check
- `POST /generate_presigned_post`: Generate presigned S3 upload URL
- `POST /generate_pdf`: Generate PDF from form data
- `POST /send_email`: Send email with PDF attachment

## Deployment

```bash
just release <environment>
```

This builds and pushes the Docker image to ECR for the specified environment.

## Project Structure

- `src/server.py`: Main Flask application
- `src/core/`: Core services and utilities
  - `pdf_generator_service.py`: PDF generation logic
  - `email_service.py`: Email sending functionality
  - `data_types.py`: Data models
  - `utils.py`: Utility functions
  - `environment_variables.py`: Environment validation
