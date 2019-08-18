from types import SimpleNamespace

from . import Error

DEFAULTS = SimpleNamespace(
    background_color="black",
    title_font_size=120,
    width=1920,
    height=1080,
    font="sans-serif"
)

def presentation_data(config):
    """Converts YML presentation representation into instructions object."""
    data = {
        "title": config.get("title"),
        "defaults": {
            "font": config.get("defaults", {}).get("font", DEFAULTS.font)
        },
        "fonts": config.get("fonts", []),
        "size": {
            "width": config.get("size", {}).get("width", DEFAULTS.width),
            "height": config.get("size", {}).get("height", DEFAULTS.height)
        },
        "slides": []
    }
    for slide in config.get("slides", []):

        # title slide
        if isinstance(slide, str):
            slide = title_slide(slide, data)
            data["slides"].append(slide)
    return data


def title_slide(slide, data):
    return {
        "layout": "title",
        "content": slide,
        "font": data["defaults"]["font"],
        "size": DEFAULTS.title_font_size
    }
