import os
import sys
import time
import traceback

import argparse
import jinja2
import numexpr
import termcolor
import yaml

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from . import __version__, Error
from .presentation import presentation_data

env = jinja2.Environment(
    loader=jinja2.PackageLoader("vitality", "templates")
)
args = None


def calc_constructor(loader, node):
    value = loader.construct_scalar(node)
    try:
        return numexpr.evaluate(value).item()
    except Exception as e:
        print(e)
        return 0
yaml.add_constructor("!calc", calc_constructor)


def main():
    global args

    # Parse arguments
    parser = argparse.ArgumentParser(description="Generate presentation slides.")
    parser.add_argument("config", type=str, help="slide configuration file")
    parser.add_argument("-o", "--output", type=str, required=True, help="output file")
    parser.add_argument("-r", "--remote-d3", action="store_true", default=False, help="load d3.js remotely")
    parser.add_argument("-v", "--verbose", action="store_true", help="verbose mode")
    parser.add_argument("-V", "--version", action="version", version=f"%(prog)s {__version__}")
    parser.add_argument("-w", "--watch", action="store_true", help="watch file for changes")
    args = parser.parse_args()

    if args.verbose:
        excepthook.verbose = True
    sys.excepthook = excepthook

    compile_presentation(
        filename=args.config,
        outfile=args.output,
        remote_d3=args.remote_d3
    )

    if args.watch:
        watch()

def compile_presentation(filename, outfile, remote_d3=False):

    # Read slide configuration file
    try:
        with open(filename) as f:
            config = yaml.load(f.read())
    except FileNotFoundError:
        raise Error("Configuration file does not exist.")

    # Generate instructions object
    data = presentation_data(config)

    # Render template and generate presentation
    template = env.get_template("presentation.html")
    presentation = template.render(
        data=data,
        remote_d3=remote_d3,
        version=__version__
    )
    with open(outfile, "w") as f:
        f.write(presentation)
    termcolor.cprint(f"Presentation generated at {outfile}", color="green")


class FileChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        global args
        if self.dirname == event.src_path:
            print("Re-generating presentation...")
            try:
                compile_presentation(args.config, args.output, remote_d3=args.remote_d3)
            except Exception:
                termcolor.cprint("Error when compiling presentation.", color="red")


def watch():
    print("Watching...")
    event_handler = FileChangeHandler()
    event_handler.dirname = os.path.dirname(os.path.abspath(args.config))
    observer = Observer()
    observer.schedule(event_handler, event_handler.dirname)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


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
