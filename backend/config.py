import os
from typing import List

import boto3
from botocore.config import Config as BotoConfig
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv('AWS_REGION', 'ap-south-1')

BEDROCK_MODEL_ID = os.getenv(
    'BEDROCK_MODEL_ID',
    'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
)

# Comma-separated list of allowed origins for CORS.
# Example: "http://localhost:5173,https://voiceofjustice.app"
CORS_ALLOW_ORIGINS: List[str] = os.getenv(
    'CORS_ALLOW_ORIGINS',
    'http://localhost:5173',
).split(',')

# Optional API key for authenticating requests to protected endpoints.
# When unset or empty, authentication is disabled (useful for local dev).
API_KEY = os.getenv('API_KEY', '').strip() or None

bedrock = boto3.client(
    service_name='bedrock-runtime',
    region_name=AWS_REGION,
    config=BotoConfig(
        read_timeout=30,
        connect_timeout=5,
        retries={'max_attempts': 1},
    ),
)

