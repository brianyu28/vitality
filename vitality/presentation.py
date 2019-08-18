from types import SimpleNamespace

from . import Error

DEFAULTS = SimpleNamespace(
    background_color="black",
    width=1920,
    height=1080
)

def presentation_data(config):
    """Converts YML presentation representation into instructions object."""
    data = {
        "title": config.get("title"),
        "size": {
            "width": config.get("size", {}).get("width", DEFAULTS.width),
            "height": config.get("size", {}).get("height", DEFAULTS.height)
        },
        "slides": []
    }
    for slide in config.get("slides", []):
        data["slides"].append(slide)
    return data
