# Vitality

**This tool is currently in active development. The API may change at any time, and many features are still in progress.**

Vitality is a tool for generated dynamic and interactive presentation slides from a text-based configuration file.

Vitality uses a YAML configuration file to define a presentation. A sample presentation might look like the below:

```yaml
title: "My Presentation"
defaults:
    background_color: white
    color: black
slides:

    - type: title
      title: My Presentation
      subtitle: August 2019

    - First Section

    - type: bullets
      title: Agenda
      bullets:
        - First bullet here.
        - Another bullet goes here.
        - Here's some more text.
        - Fourth bullet.

    - Next Section
```

Once installed, Vitality can be run as:

```
vitality config.yml -o presentation.html
```

Open up `presentation.html` to view the resulting presentation! The right and left arrow keys can be used to move forward and backwards through the slides, and the `z` key will return the presenter to the beginning of the presentation.

