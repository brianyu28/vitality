from setuptools import setup, find_packages

with open("README.md") as f:
    readme = f.read()

with open("LICENSE") as f:
    license = f.read()

setup(
    author="Brian Yu",
    author_email="brian@brianyu.me",
    description="Easily configurable presentation software.",
    entry_points={
        "console_scripts": ["vitality=vitality.__main__:main"]
    },
    include_package_data=True,
    install_requires=[
        "argparse>=1.4",
        "jinja2>=2.10",
        "numexpr>=2.7",
        "pyyaml>=3.13",
        "termcolor>=1.1",
        "watchdog>=0.9"
    ],
    license=license,
    long_description=readme,
    long_description_content_type="text/markdown",
    name="vitality",
    packages=["vitality"],
    url="https://github.com/brianyu28/vitality",
    version="0.1.5"
)

