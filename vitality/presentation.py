from types import SimpleNamespace

from . import Error

DEFAULTS = SimpleNamespace(

    # Dimensions
    height=1080,
    width=1920,

    # Layout
    background_color="black",
    font="sans-serif",
    text_color="white",

    # Font Sizes
    section_font_size=100,
    subtitle_font_size=60,
    title_font_size=120
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

        if slide is None:
            slide = {}
            result = blank_slide(slide, data)

        # Just string is a section slide
        elif isinstance(slide, str):
            slide = {"text": slide}
            result = section_slide(slide, data)

        elif slide["type"] == "section":
            result = section_slide(slide, data)

        elif slide["type"] == "title":
            result = title_slide(slide, data)

        elif slide["type"] == "blank":
            result = blank_slide(slide, data)

        else:
            result = blank_slide(slide, data)

        # TODO: deal with custom objects here
        if slide.get("objects") is not None:
            pass

        data["slides"].append(result)
    return data


def base_slide(slide, data):
    """Basic elements on every slide."""
    return {
        "backgroundColor": slide.get("background_color", data["defaults"]["background_color"]),
    }


def blank_slide(slide, data):
    """Empty slide with no content."""
    result = base_slide(slide, data)
    result.update({
        "layout": "blank"
    })
    return result

def section_slide(slide, data):
    """Section divider slide, just a single heading."""
    result = base_slide(slide, data)
    result.update({
        "layout": "section",
        "color": slide.get("color", data["defaults"]["color"]),
        "content": slide.get("text", ""),
        "font": slide.get("font", data["defaults"]["font"]),
        "size": slide.get("size", DEFAULTS.section_font_size)
    })
    return result


def title_slide(slide, data):
    """Title slide, with title and multi-line subtitle."""
    result = base_slide(slide, data)

    # Allow string literals as title and subtitle
    if isinstance(slide["title"], str):
        slide["title"] = {
            "text": slide["title"]
        }
    if isinstance(slide["subtitle"], str):
        slide["subtitle"] = {
            "text": [slide["subtitle"]]
        }
    elif isinstance(slide["subtitle"], list):
        slide["subtitle"] = {
            "text": slide["subtitle"]
        }
    if not isinstance(slide["subtitle"].get("text", []), list):
        slide["subtitle"]["text"] = [slide["subtitle"]["text"]]

    # Allow specifying color and font for entire slide
    for prop in ["color", "font"]:
        if slide.get(prop):
            slide["title"][prop] = slide["title"].get(prop, slide[prop])
            slide["subtitle"][prop] = slide["subtitle"].get(prop, slide[prop])

    result.update({
        "layout": "title",
        "title": {
            "color": slide["title"].get("color", data["defaults"]["color"]),
            "content": slide["title"].get("text", ""),
            "font": slide["title"].get("font", data["defaults"]["font"]),
            "size": slide["title"].get("size", DEFAULTS.title_font_size)
        },
        "subtitle": {
            "color": slide["subtitle"].get("color", data["defaults"]["color"]),
            "content": slide["subtitle"].get("text", []),
            "font": slide["subtitle"].get("font", data["defaults"]["font"]),
            "size": slide["title"].get("size", DEFAULTS.subtitle_font_size)
        }
    })
    return result
