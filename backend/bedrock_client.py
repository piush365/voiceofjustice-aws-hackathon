import json

from fastapi import HTTPException, status

from config import BEDROCK_MODEL_ID, bedrock


def invoke_bedrock_claude(prompt: str, max_tokens: int = 1000) -> str:
    """
    Call Amazon Bedrock Claude model and return the text response.

    Any low‑level errors are logged server‑side, but the client receives a
    generic message to avoid leaking infrastructure details.
    """
    try:
        response = bedrock.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps(
                {
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": max_tokens,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                }
            ),
        )

        result = json.loads(response["body"].read())
        return result["content"][0]["text"]

    except Exception as exc:  # noqa: BLE001
        # Log full error on the server only.
        print(f"[Bedrock] Error while invoking model {BEDROCK_MODEL_ID}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Upstream AI service error. Please try again later.",
        ) from exc

