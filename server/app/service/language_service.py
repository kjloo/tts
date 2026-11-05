from typing import ClassVar


class LanguageService:
    """Singleton language service using class-level state."""

    SUPPORTED_LANGUAGES: ClassVar[list[str]] = [
        "Japanese",
        "English",
        "Chinese",
        "Korean",
        "German",
        "French",
        "Spanish",
        "Italian",
    ]

    @classmethod
    def get_supported_languages(cls) -> list[str]:
        return cls.SUPPORTED_LANGUAGES
