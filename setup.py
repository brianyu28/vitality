from setuptools import setup, find_packages

setup(
    author="Brian Yu",
    author_email="brian@brianyu.me",
    description="Easily configurable presentation software.",
    entry_points={
        "console_scripts": ["vitality=vitality.__main__:main"]
    },
    install_requires=[
        "argparse>=1.4",
        "jinja2>=2.10",
        "numexpr>=2.7",
        "pyyaml>=3.13",
        "termcolor>=1.1",
        "watchdog>=0.9"
    ],
    name="vitality",
    packages=["vitality"],
    url="https://github.com/brianyu28/vitality",
    version="0.1.3"
)

