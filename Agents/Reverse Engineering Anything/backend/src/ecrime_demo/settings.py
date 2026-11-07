"""Application configuration and constants."""

from functools import lru_cache
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = Path(__file__).parent / "resources" / "catalog.json"

API_PREFIX = "/v1"
REPORT_REFERENCE_PREFIX = "DEMO"
SUBMISSION_REFERENCE_PREFIX = "DEMO-SVC"
REPORT_STATUS = "Demo received"
SUBMISSION_STATUS = "Local simulation completed"
MAX_EVIDENCE_FILES = 5
MAX_FILE_BYTES = 5 * 1024 * 1024
ALLOWED_FILE_TYPES = frozenset({"text/plain", "image/png", "image/jpeg", "application/pdf"})
DEFAULT_PAGE_SIZE = 50
MAX_PAGE_SIZE = 200
MAX_STORED_RECORDS = 200


class Settings(BaseSettings):
    """Environment-driven settings, validated at startup."""

    model_config = SettingsConfigDict(env_prefix="ECRIME_", env_file=".env", extra="ignore")

    database_url: str = f"sqlite+aiosqlite:///{(BACKEND_ROOT / 'database' / 'ecrime_demo.db').as_posix()}"
    cors_origins: list[str] = ["http://127.0.0.1:5173", "http://localhost:5173"]
    # Bedrock model for /v1/chat. Empty means no model, and /v1/chat returns 503 (there are no canned answers).
    model_id: str = ""
    # Region for the Bedrock call. AWS credentials are NOT settings: boto3 reads AWS_ACCESS_KEY_ID,
    # AWS_SECRET_ACCESS_KEY and AWS_SESSION_TOKEN from the environment.
    aws_region: str = Field(default="us-east-1", validation_alias=AliasChoices("AWS_REGION", "ECRIME_AWS_REGION"))
    model_max_tokens: int = Field(default=600, ge=50, le=4000)
    model_timeout_seconds: float = Field(default=20.0, gt=0, le=120)
    # Speech-to-text (faster-whisper, runs on this machine, no AWS). Models download on first use.
    stt_model: str = "base"
    stt_preload: bool = True  # load the model in the background at startup, so the first recording is not slow
    stt_device: str = "cpu"
    stt_compute_type: str = "int8"
    stt_cpu_threads: int = Field(default=0, ge=0, le=64)  # 0 = let the library choose
    stt_max_audio_bytes: int = Field(default=10 * 1024 * 1024, ge=1024, le=100 * 1024 * 1024)
    stt_max_audio_seconds: float = Field(default=60.0, gt=0, le=600)


@lru_cache
def get_settings() -> Settings:
    """Return cached settings."""
    return Settings()


# Services assistant
ACCESS_PATH = Path(__file__).parent / "resources" / "access.json"
MAX_MESSAGE_LENGTH = 500
MAX_TURN_LENGTH = 1200
MAX_HISTORY_TURNS = 20
MAX_SERVICE_RESULTS = 3
MAX_DESCRIPTION_LENGTH = 240

NAME_WEIGHT = 3.0
GROUP_WEIGHT = 1.5
DESCRIPTION_WEIGHT = 1.0
PHRASE_BONUS = 5.0
WEAK_NAME_WEIGHT = 1.5
WEAK_NAME_WORDS = frozenset({"police"})
MIN_MATCH_SCORE = 3.0
RELATIVE_CUTOFF = 0.5

CONTACT_PHONE = "901"
CONTACT_EMAIL = "mail@dubaipolice.gov.ae"
CONTACT_ADDRESS = "P.O. Box 1493, Dubai, United Arab Emirates"
EMERGENCY_NUMBER = "999"

DEMO_NOTICE = "This is a demo: requests made here are simulations and are not sent to Dubai Police."

# Speech-to-text
STT_SAMPLE_RATE = 16000
STT_MIN_AUDIO_SECONDS = 0.2
STT_ALLOWED_CONTENT_TYPES = frozenset(
    {"audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/x-wav", "audio/wave", "audio/flac",
     "audio/x-flac", "audio/aac", "audio/x-m4a", "audio/m4a", "video/webm", "video/mp4", "application/ogg",
     "application/octet-stream"}
)  # fmt: skip

# Model-backed answers
MODEL_HISTORY_TURNS = 6
MODEL_TEMPERATURE = 0.2
