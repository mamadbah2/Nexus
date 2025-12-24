from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.schemas.transcription import TranscriptionResponse
from app.services.inference_service import InferenceService
from typing import Annotated
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    file: Annotated[UploadFile, File(description="Audio file (.wav, .mp3, .webm, .ogg)")],
    language: Annotated[str, Form(description="Language code (wol, fuf)", pattern="^(wol|ful)$")]
):
    """
    Transcribe an audio file to text.
    """
    logger.info(f"Received transcription request. File: {file.filename}, Content-Type: {file.content_type}, Language: {language}")

    allowed_extensions = ('.wav', '.WAV', '.mp3', '.MP3', '.webm', '.WEBM', '.ogg', '.OGG', '.mp2', '.MP2')
    if not file.filename.endswith(allowed_extensions):
         logger.warning(f"Rejected file extension: {file.filename}")
         raise HTTPException(status_code=400, detail=f"File extension not supported. Allowed: {allowed_extensions}")
         
    return await InferenceService.transcribe(file, language)
