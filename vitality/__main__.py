import sys
import traceback

import argparse
import jinja2
import termcolor
import yaml

from . import __version__, Error
from .presentation import presentation_data

env = jinja2.Environment(
    loader=jinja2.PackageLoader("vitality", "templates")
)


def main():

    # Parse arguments
    parser = argparse.ArgumentParser(description="Generate presentation slides.")
    parser.add_argument("config", type=str, help="slide configuration file")
    parser.add_argument("-o", "--output", type=str, required=True, help="output file")
    parser.add_argument("-r", "--remote-d3", action="store_true", default=False, help="load d3.js remotely")
    parser.add_argument("-v", "--verbose", action="store_true", help="verbose mode")
    parser.add_argument("-V", "--version", action="version", version=f"%(prog)s {__version__}")
    args = parser.parse_args()

    if args.verbose:
        excepthook.verbose = True
    sys.excepthook = excepthook

    # Read slide configuration file
    try:
        with open(args.config) as f:
            config = yaml.load(f.read())
    except FileNotFoundError:
        raise Error("Configuration file does not exist.")

    # Generate instructions object
    data = presentation_data(config)

    # Render template and generate presentation
    template = env.get_template("presentation.html")
    presentation = template.render(
        data=data,
        remote_d3=args.remote_d3,
        version=__version__
    )
    with open(args.output, "w") as f:
        f.write(presentation)
    termcolor.cprint(f"Presentation generated at {args.output}", color="green")


def excepthook(type, value, tb):
    if excepthook.verbose:
        traceback.print_exception(type, value, tb)
    elif issubclass(type, Error):
        termcolor.cprint(value, color="red")
    else:
        termcolor.cprint("vitality encountered an error. Re-run with --verbose for details.", color="red")
excepthook.verbose = False


if __name__ == "__main__":
    main()
