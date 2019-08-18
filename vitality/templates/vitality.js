const state = {
    aspectRatio: null,
    objects: {},
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

    drawHeadline("Testing");

    /*
    state.svg.append("circle")
             .attr("cx", 300)
             .attr("cy", 300)
             .attr("r", 50)
             .style("fill", "blue");
    console.log(state.svg);
    */
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
            console.log("moving forwards...");
            e.preventDefault();
            break;
        case KEYS.leftArrow:
            console.log("move backwards...");
            e.preventDefault();
        default:
            break;
    }
});

function drawHeadline(text) {
    const elt = state.svg.append("text")
                         .attr("x", "50%")
                         .attr("y", "50%")
                         .attr("dominant-baseline", "middle")
                         .attr("text-anchor", "middle")
                         .attr("font-size", 120)
                         .style("fill", "white")
                         .text(text);
}

