from types import SimpleNamespace

from . import Error

DEFAULTS = SimpleNamespace(
    background_color="black",
    font="sans-serif",
    height=1080,
    section_font_size=120,
    text_color="white",
    width=1920
)

def presentation_data(config):
    """Converts YML presentation representation into instructions object."""
    defaults = config.get("defaults", {})
    data = {
        "title": config.get("title"),
        "defaults": {
            "background_color": defaults.get("background_color", DEFAULTS.background_color),
            "color": defaults.get("color", DEFAULTS.text_color),
            "font": defaults.get("font", DEFAULTS.font)
        },
        "fonts": config.get("fonts", []),
        "size": {
            "width": config.get("size", {}).get("width", DEFAULTS.width),
            "height": config.get("size", {}).get("height", DEFAULTS.height)
        },
        "slides": []
    }
    for slide in config.get("slides", []):

        # just string, section slide
        if isinstance(slide, str):
            slide = section_slide({"text": slide}, data)

        elif slide["type"] == "section":
            slide = section_slide(slide, data)

        elif slide.get("objects") is None:
            continue

        # TODO: deal with custom objects here
        if slide.get("objects") is not None:
            pass

        data["slides"].append(slide)
    return data


def section_slide(slide, data):
    return {
        "layout": "section",
        "backgroundColor": slide.get("background_color", data["defaults"]["background_color"]),
        "color": slide.get("color", data["defaults"]["color"]),
        "content": slide.get("text", ""),
        "font": slide.get("font", data["defaults"]["font"]),
        "size": slide.get("size", DEFAULTS.section_font_size)
    }
