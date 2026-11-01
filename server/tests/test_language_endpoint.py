def test_get_supported_languages(client):
    response = client.get("/api/languages/")

    assert response.status_code == 200
    data = response.json()
    assert "languages" in data
    assert data["languages"] == [
        "English",
        "Chinese",
        "Japanese",
        "Korean",
        "German",
        "French",
        "Spanish",
        "Italian",
    ]
