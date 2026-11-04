"""Unit tests for shared utility helpers."""

from app.utils import get_unique_path


def test_unique_path_starts_at_01_and_prepends_speaker(tmp_path):
    path = get_unique_path(tmp_path, "clone", "Fiora", "English", "hello")

    assert path.name == "Fiora_hello_01.mp3"
    assert path.parent == tmp_path


def test_unique_path_increments_when_file_exists(tmp_path):
    first = get_unique_path(tmp_path, "clone", "Fiora", "English", "hello")
    first.write_bytes(b"")

    second = get_unique_path(tmp_path, "clone", "Fiora", "English", "hello")
    second.write_bytes(b"")

    third = get_unique_path(tmp_path, "clone", "Fiora", "English", "hello")

    assert second.name == "Fiora_hello_02.mp3"
    assert third.name == "Fiora_hello_03.mp3"


def test_unique_path_defaults_to_speaker_and_language(tmp_path):
    path = get_unique_path(tmp_path, "clone", "Fiora", "English")

    assert path.name == "Fiora_English_01.mp3"


def test_unique_path_accepts_filename_with_extension(tmp_path):
    path = get_unique_path(tmp_path, "clone", "Fiora", "English", "hello.mp3")

    assert path.name == "Fiora_hello_01.mp3"
