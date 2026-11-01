from typing import ClassVar


class LanguageService:
    """Singleton language service using class-level state."""

    SUPPORTED_LANGUAGES: ClassVar[list[str]] = [
        "English",
        "Chinese",
        "Japanese",
        "Korean",
        "German",
        "French",
        "Spanish",
        "Italian",
    ]

    @classmethod
    def get_supported_languages(cls) -> list[str]:
        return cls.SUPPORTED_LANGUAGES
