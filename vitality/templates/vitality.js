const state = {
    aspectRatio: null,
    cursorTimeout: null,
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

    console.log("rendering slide " + slideIdx);

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
        case "section":
            renderSection(slide);
    }
}

function renderSection(slide) {
    const elt = state.svg.append("text")
                         .attr("x", "50%")
                         .attr("y", "50%")
                         .attr("dominant-baseline", "middle")
                         .attr("text-anchor", "middle")
                         .attr("font-size", slide.size)
                         .attr("font-family", slide.font)
                         .style("fill", slide.color)
                         .text(slide.content);
    state.objects.push(elt);
}

