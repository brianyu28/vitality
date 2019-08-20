import copy

from types import SimpleNamespace

from . import Error

DEFAULTS = SimpleNamespace(

    # Dimensions
    height=1080,
    width=1920,
    html_zoom="220%",

    # Spacing
    bullets_padding_left=100,
    heading_padding_left=50,
    heading_padding_top=80,

    # Layout
    background_color="black",
    color="white",
    font="sans-serif",

    # Transitions
    transition_length=500,

    # Builds
    build_bullets=False,

    # Font Sizes
    heading_font_size=80,
    section_font_size=100,
    subtitle_font_size=60,
    text_font_size=55,
    title_font_size=120,

    # Bullets
    bullet=chr(8226)+" ",
    bullet_spacing=30
)

def presentation_data(config):
    """Converts YML presentation representation into instructions object."""
    defaults = copy.copy(DEFAULTS)
    defaults.__dict__.update(config.get("defaults", {}))
    data = {
        "title": config.get("title"),
        "defaults": defaults.__dict__,
        "fonts": config.get("fonts", []),
        "size": {
            "width": config.get("size", {}).get("width", DEFAULTS.width),
            "height": config.get("size", {}).get("height", DEFAULTS.height)
        },
        "slides": []
    }

    # Add configuration results for all slides
    for slide in config.get("slides", []):

        if slide is None:
            slide = {}
            result = blank_slide(slide, data)

        # Just string is a section slide
        elif isinstance(slide, str):
            slide = {"text": slide}
            result = section_slide(slide, data)

        elif slide.get("type") == "section":
            result = section_slide(slide, data)

        elif slide.get("type") == "title" or all(prop in slide for prop in ["title", "subtitle"]):
            result = title_slide(slide, data)

        elif slide.get("type") == "bullets":
            result = bullets_slide(slide, data)

        elif slide.get("type") == "html" or "html" in slide:
            result = html_slide(slide, data)

        else:
            result = blank_slide(slide, data)

        if slide.get("objects") is not None:
            add_objects(result, slide.get("objects"), data)

        data["slides"].append(result)


    # Add slide identifier mapping
    data["slide_ids"] = {}
    for i, slide in enumerate(data["slides"]):
        if slide["id"] is not None:
            data["slide_ids"][slide["id"].upper()] = i
    return data


def base_slide(slide, data):
    """Basic elements on every slide."""
    return {
        "backgroundColor": slide.get("background_color", data["defaults"]["background_color"]),
        "id": slide.get("id"),
        "objects": []
    }


def blank_slide(slide, data):
    """Empty slide with no content."""
    result = base_slide(slide, data)
    result.update({
        "layout": "blank"
    })
    return result


def bullets_slide(slide, data):
    """Slide with title and bullets."""
    result = base_slide(slide, data)

    # Handle empty title, or title as single string
    if "title" not in slide:
        slide["title"] = {}
    elif isinstance(slide["title"], str):
        slide["title"] = {"text": slide["title"]}

    if "bullets" not in slide:
        slide["bullets"] = []
    if isinstance(slide["bullets"], str):
        slide["bullets"] = {
            "text": [slide["bullets"]]
        }
    elif isinstance(slide["bullets"], list):
        slide["bullets"] = {
            "text": slide["bullets"]
        }
    if not isinstance(slide["bullets"].get("text", []), list):
        slide["bullets"]["text"] = [slide["bullets"]["text"]]

    # Handling bullet styling
    for i in range(len(slide["bullets"]["text"])):
        bullet = slide["bullets"]["text"][i]
        if isinstance(bullet, str):
            slide["bullets"]["text"][i] = {"text": bullet}

    # Allow specifying color and font for entire slide
    for prop in ["color", "font", "padding_left"]:
        if slide.get(prop):
            slide["title"][prop] = slide["title"].get(prop, slide[prop])
            slide["bullets"][prop] = slide["bullets"].get(prop, slide[prop])

    result.update({
        "layout": "bullets",
        "title": {
            "color": slide["title"].get("color", data["defaults"]["color"]),
            "content": slide["title"].get("text", ""),
            "font": slide["title"].get("font", data["defaults"]["font"]),
            "padding_left": slide["title"].get("padding_left", data["defaults"]["heading_padding_left"]),
            "padding_top": slide["title"].get("padding_top", data["defaults"]["heading_padding_top"]),
            "size": slide["title"].get("size", data["defaults"]["heading_font_size"])
        },
        "bullets": {
            "build": slide.get("build", data["defaults"]["build_bullets"]),
            "bullet": slide["bullets"].get("bullet", data["defaults"]["bullet"]),
            "color": slide["bullets"].get("color", data["defaults"]["color"]),
            "content": slide["bullets"].get("text", []),
            "font": slide["bullets"].get("font", data["defaults"]["font"]),
            "padding_left": slide["title"].get("padding_left", data["defaults"]["bullets_padding_left"]),
            "size": slide["bullets"].get("size", data["defaults"]["text_font_size"]),
            "spacing": slide["bullets"].get("spacing", data["defaults"]["bullet_spacing"])
        }
    })
    return result


def html_slide(slide, data):
    """Slide with custom HTML."""
    result = base_slide(slide, data)
    result.update({
        "layout": "html",
        "content": slide.get("html", "")
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
        "size": slide.get("size", data["defaults"]["section_font_size"])
    })
    return result


def title_slide(slide, data):
    """Title slide, with title and multi-line subtitle."""
    result = base_slide(slide, data)

    # Allow string literals as title and subtitle
    if "title" not in slide:
        slide["title"] = ""
    if "subtitle" not in slide:
        slide["subtitle"] = ""
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
            "size": slide["title"].get("size", data["defaults"]["title_font_size"])
        },
        "subtitle": {
            "color": slide["subtitle"].get("color", data["defaults"]["color"]),
            "content": slide["subtitle"].get("text", []),
            "font": slide["subtitle"].get("font", data["defaults"]["font"]),
            "size": slide["subtitle"].get("size", data["defaults"]["subtitle_font_size"])
        }
    })
    return result


def add_objects(result, objects, data):
    for obj in objects:

        # If there's a matching object in previous slide, carry over properties
        if "id" in obj and len(data["slides"]) > 0:

            # Look for matching object on previous slide
            for prev_obj in data["slides"][-1].get("objects", []):
                if prev_obj.get("id") == obj["id"]:

                    # Copy old properties, remove "build" property
                    temp_obj = copy.copy(prev_obj)
                    if "build" in temp_obj:
                        del temp_obj["build"]

                    # Update attrs and style fields
                    for prop in ["attrs", "style"]:
                        if prop in temp_obj:
                            temp_obj[prop] = copy.copy(temp_obj[prop])
                        for key in obj.get(prop, {}):
                            temp_obj[prop][key] = obj[prop][key]

                    # Update other fields on the object
                    for prop in ["id", "type", "transition_length"]:
                        if prop in obj:
                            temp_obj[prop] = obj[prop]
                    obj = temp_obj

        if "transition_length" not in obj:
            obj["transition_length"] = data["defaults"]["transition_length"]

        if obj.get("type") == "html":
            obj = {
                "type": "html",
                "attrs": {
                    "x": obj.get("attrs", {}).get("x", 0),
                    "y": obj.get("attrs", {}).get("y", 0),
                    "height": obj.get("attrs", {}).get("height", "100%"),
                    "width": obj.get("attrs", {}).get("width", "100%")
                },
                "style": {
                    "fill": obj.get("style", {}).get("fill", data["defaults"]["background_color"]),
                    "zoom": obj.get("style", {}).get("zoom", data["defaults"]["html_zoom"])
                },
                "content": obj.get("html", "")
            }
        result["objects"].append(obj)
