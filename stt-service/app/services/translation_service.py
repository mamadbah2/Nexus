from google import genai
from google.genai import types
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class TranslationService:
    _client = None

    @classmethod
    def get_client(cls):
        if not cls._client:
            cls._client = genai.Client(api_key=settings.GEMINI_API_KEY)
        return cls._client

    @staticmethod
    async def translate_to_french(text: str, source_lang_code: str) -> str:
        if not text or len(text.strip()) == 0:
            return ""

        # Mapping des codes vers les noms complets
        lang_map = {
            "wol": "Wolof",
            "fuf": "Pular (Fula)",
            "fra": "French"
        }
        source_lang = lang_map.get(source_lang_code, source_lang_code)

        try:
            client = TranslationService.get_client()
            
            prompt = f"T'es expert en poular et wolof. Traduis le texte suivant du {source_lang} vers le Français. Donne uniquement la traduction, sans texte introductif ni guillemets.\n\nTexte: {text}"

            # Utilisation du client asynchrone (aio) avec le nouveau SDK
            response = await client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    thinking_config=types.ThinkingConfig(thinking_level="low")
                ),
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Translation failed: {str(e)}")
            return ""