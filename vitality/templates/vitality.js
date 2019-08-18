const state = {
    aspectRatio: null,
    cursorTimeout: null,
    dimensions: {
        width: null,
        height: null
    },
    objects: [],
    references: {},
    slideIdx: null,
    svg: null
};

const KEYS = {
    space: 32,
    leftArrow: 37,
    rightArrow: 39,
    z: 90
}

// Set up presentation
document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector("body")
    body.style.margin = 0;
    body.style.backgroundColor = "black";

    state.dimensions.width = data.size.width;
    state.dimensions.height = data.size.height;
    state.aspectRatio = data.size.width / data.size.height;

    const padding = 1 + (window.innerHeight - (window.innerWidth / state.aspectRatio)) / 2;
    state.svg = d3.select("body")
                  .append("svg")
                  .attr("width", window.innerWidth)
                  .attr("height", window.innerWidth / state.aspectRatio)
                  .attr("viewBox", "0 0 1920 1080")
                  .style("margin-top", padding)
                  .style("margin-bottom", padding)
                  .style("background-color", "black");

    renderSlide(0);
    state.cursorTimeout = setTimeout(hideCursor, 1000);
});

// Window resizes, resize SVG to fit
window.addEventListener("resize", () => {
    const padding = 1 + (window.innerHeight - (window.innerWidth / state.aspectRatio)) / 2;
    state.svg.attr("width", window.innerWidth)
             .attr("height", window.innerWidth / state.aspectRatio)
             .style("margin-top", padding)
             .style("margin-bottom", padding);
});

window.addEventListener("keydown", (e) => {
    switch (e.keyCode) {
        case KEYS.rightArrow:
        case KEYS.space:
            e.preventDefault();
            renderSlide(Math.min(state.slideIdx + 1, data.slides.length - 1));
            break;
        case KEYS.leftArrow:
            e.preventDefault();
            renderSlide(Math.max(state.slideIdx - 1, 0));
            break;
        case KEYS.z:
            e.preventDefault();
            renderSlide(0);
            break;
        default:
            break;
    }
});

window.addEventListener("mousemove", () => {
    clearTimeout(state.cursorTimeout);
    document.body.style.cursor = "";
    state.cursorTimeout = setTimeout(hideCursor, 1000);
});

function hideCursor() {
    document.body.style.cursor = "none";
}

function renderSlide(slideIdx) {

    // Update slide index
    state.slideIdx = slideIdx;

    // Remove previous content
    // TODO: if transitions are on, transition objects instead
    for (let i = 0; i < state.objects.length; i++) {
        state.objects[i].remove();
    }


    // Update with current slide
    const slide = data.slides[slideIdx];
    state.svg.style("background-color", slide.backgroundColor);
    switch (slide.layout) {
        case "bullets":
            renderBulletsSlide(slide);
            break;
        case "section":
            renderSectionSlide(slide);
            break;
        case "title":
            renderTitleSlide(slide);
            break;
    }
}

function renderBulletsSlide(slide) {
    const heading =
        state.svg.append("text")
             .attr("x", slide.title.padding_left)
             .attr("y", slide.title.padding_top + slide.title.size)
             .attr("font-size", slide.title.size)
             .attr("font-family", slide.title.font)
             .attr("fill", slide.title.color)
             .text(slide.title.content);
    state.objects.push(heading);

    const bullets_height = state.dimensions.height
                          - slide.title.padding_top * 3
                          - slide.title.size;
    const bullet_height = slide.bullets.size + slide.bullets.spacing;
    const bullet_y = slide.title.padding_top
                     + slide.title.size + (bullets_height / 2)
                     - bullet_height * (slide.bullets.content.length / 2);
    const bullets =
        state.svg.append("text")
             .attr("x", slide.bullets.padding_left)
             .attr("y", bullet_y)
             .attr("dominant-baseline", "middle")
             .attr("font-size", slide.bullets.size)
             .attr("font-family", slide.bullets.font)
             .style("fill", slide.bullets.color);
    for (let i = 0; i < slide.bullets.content.length; i++) {
        bullets.append("tspan")
               .attr("x", slide.bullets.padding_left)
               .attr("dy", slide.bullets.size + slide.bullets.spacing)
               .text(slide.bullets.bullet + slide.bullets.content[i]);
    }
    state.objects.push(bullets);
}

function renderSectionSlide(slide) {
    const section =
        state.svg.append("text")
             .attr("x", "50%")
             .attr("y", "50%")
             .attr("dominant-baseline", "middle")
             .attr("text-anchor", "middle")
             .attr("font-size", slide.size)
             .attr("font-family", slide.font)
             .style("fill", slide.color)
             .text(slide.content);
    state.objects.push(section);
}

function renderTitleSlide(slide) {
    const title =
        state.svg.append("text")
             .attr("x", "50%")
             .attr("y", "45%")
             .attr("dominant-baseline", "middle")
             .attr("text-anchor", "middle")
             .attr("font-size", slide.title.size)
             .attr("font-family", slide.title.font)
             .style("fill", slide.title.color)
             .text(slide.title.content);
    state.objects.push(title);

    const subtitle =
        state.svg.append("text")
             .attr("x", "50%")
             .attr("y", "60%")
             .attr("dominant-baseline", "middle")
             .attr("text-anchor", "middle")
             .attr("font-size", slide.subtitle.size)
             .attr("font-family", slide.subtitle.font)
             .style("fill", slide.subtitle.color);
    for (let i = 0; i < slide.subtitle.content.length; i++) {
        subtitle.append("tspan")
                .attr("x", "50%")
                .attr("dy", slide.subtitle.size + 5)
                .text(slide.subtitle.content[i]);
    }
    state.objects.push(subtitle);
}
