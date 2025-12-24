import librosa
import numpy as np
import logging
import tempfile
import os
import shutil
import soundfile as sf
from pydub import AudioSegment
from fastapi import UploadFile

logger = logging.getLogger(__name__)

class AudioProcessor:
    @staticmethod
    def process_audio(file: UploadFile) -> tuple[np.ndarray, float]:
        temp_file_path = None
        try:
            # Rembobiner le fichier au début par sécurité
            file.file.seek(0)
            
            # 1. Créer un fichier temporaire sur le disque
            # L'extension est CRUCIALE pour que librosa/ffmpeg détecte le format (ex: .webm)
            suffix = os.path.splitext(file.filename)[1] if file.filename else ""
            if not suffix:
                suffix = ".tmp"

            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                # Copier le contenu de la mémoire vers le disque
                shutil.copyfileobj(file.file, tmp)
                temp_file_path = tmp.name

            # 2. Conversion forcée en WAV propre avec pydub (utilise ffmpeg)
            logger.info(f"Converting audio from {temp_file_path}...")
            try:
                # Pydub détecte automatiquement le format (mp3, webm, wav corrompu...)
                audio = AudioSegment.from_file(temp_file_path)
                
                # On force la conversion en WAV mono 16kHz (format idéal pour l'IA)
                audio = audio.set_frame_rate(16000).set_channels(1)
                
                # On exporte vers un nouveau fichier temporaire
                converted_path = temp_file_path + "_converted.wav"
                audio.export(converted_path, format="wav")
                
                # Maintenant on charge ce fichier propre avec librosa/soundfile
                audio_input, _ = librosa.load(converted_path, sr=16000)
                
            except Exception as e:
                logger.error(f"Pydub conversion failed: {e}")
                raise e
            
            duration = librosa.get_duration(y=audio_input, sr=16000)

            return audio_input, duration

        except Exception as e:
            logger.error(f"Error processing audio file: {e}")
            raise e
        finally:
            # 3. Nettoyage : supprimer le fichier temporaire
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                except OSError:
                    pass