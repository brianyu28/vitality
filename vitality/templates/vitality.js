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
    buildIdx: null,
    builds: [],
    go: false,
    prev: null,
    svg: null
};

const KEYS = {
    enter: 13,
    esc: 27,
    space: 32,
    leftArrow: 37,
    rightArrow: 39,
    b: 66,
    g: 71,
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

    renderSlide(0, 0);
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
    if (state.go !== false) {
        switch (e.keyCode) {
            case KEYS.esc:
                state.go = false;
                break;
            case KEYS.enter:
                const slideNo = parseInt(state.go);
                if (isNaN(slideNo)) {
                    const slideIndex = data.slide_ids[state.go];
                    if (slideIndex !== undefined) {
                        state.prev = {slideIdx: state.slideIdx, buildIdx: state.buildIdx};
                        renderSlide(slideIndex, 0);
                    }
                } else if (slideNo >= 0 && slideNo <= data.slides.length - 1) {
                    state.prev = {slideIdx: state.slideIdx, buildIdx: state.buildIdx};
                    renderSlide(slideNo, 0);
                }
                state.go = false;
                break;
            default:
                state.go += String.fromCharCode(e.keyCode);
                break;
        }
        e.preventDefault();
        return;
    }
    switch (e.keyCode) {
        case KEYS.rightArrow:
        case KEYS.space:
            e.preventDefault();
            renderNext();
            break;
        case KEYS.leftArrow:
            e.preventDefault();
            renderPrevious();
            break;
        case KEYS.b: // go back to prev
            if (state.prev !== null) {
                renderSlide(state.prev.slideIdx, state.prev.buildIdx);
                state.prev = null;
            }
            break;
        case KEYS.g: // go to slide
            e.preventDefault();
            state.go = "";
            break;
        case KEYS.z:
            e.preventDefault();
            renderSlide(0, 0);
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

function renderNext() {
    if (state.buildIdx === state.builds.length) {
        renderSlide(Math.min(state.slideIdx + 1, data.slides.length - 1), 0, transition=true);
    } else {
        // Render next build
        state.builds[state.buildIdx].forEach(obj => {
            obj.attr("display", "");
        });
        state.buildIdx += 1;
    }
}

function renderPrevious() {
    if (state.buildIdx === 0) {
        renderSlide(Math.max(state.slideIdx - 1, 0), 0);
    } else {
        // Render previous build
        state.buildIdx -= 1;
        state.builds[state.buildIdx].forEach(obj => {
            obj.attr("display", "none");
        });
    }
}

function renderSlide(slideIdx, buildIdx, transition=false) {

    // Update slide index
    state.slideIdx = slideIdx;
    state.buildIdx = 0;
    state.builds = [];
    const slide = data.slides[slideIdx];

    // If no transition, then don't need previous references
    if (transition === false) {
        state.references = {};
    }

    // Get references in new slide present at start of slide
    const references =
        new Set(slide.objects
                     .filter(obj => obj.id !== undefined &&
                            (obj.build === false || obj.build === undefined))
                     .map(obj => obj.id));

    // Get objects that need to make a transition
    const transitioners =
        Object.keys(state.references)
        .filter(id => references.has(id))
        .reduce((obj, key) => {
            obj[key] = state.references[key];
            return obj;
        }, {});

    // Remove previous content
    for (let i = 0; i < state.objects.length; i++) {
        if (transition === false ||
            Object.values(transitioners).some((k) => k.object == state.objects[i]) === false) {
            state.objects[i].remove();
            delete state.objects[i];
        }
    }
    state.objects = state.objects.filter(obj => obj !== undefined);

    // Update with current slide
    state.svg.style("background-color", slide.backgroundColor);
    switch (slide.layout) {
        case "bullets":
            renderBulletsSlide(slide);
            break;
        case "html":
            renderHTMLSlide(slide);
            break;
        case "section":
            renderSectionSlide(slide);
            break;
        case "title":
            renderTitleSlide(slide);
            break;
    }

    // Add objects
    renderObjects(slide, transitioners);

    // Filter out undefined builds
    state.builds = state.builds.filter(build => build !== undefined);

    // Render builds as needed (e.g. if returning back to slide)
    for (let i = 0; i < buildIdx; i++) {
        state.builds[i].forEach(obj => {
            obj.attr("display", "");
        });
    }
    state.buildIdx = buildIdx;
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
        const bullet =
            bullets.append("tspan")
                   .attr("x", slide.bullets.padding_left)
                   .attr("dy", slide.bullets.size + slide.bullets.spacing)
                   .attr("display", slide.bullets.build ? "none" : "")
                   .style("fill", (slide.bullets.content[i] || {}).color || slide.bullets.color)
                   .text(slide.bullets.bullet + ((slide.bullets.content[i] || {}).text || " "));
        if (slide.bullets.build) {
            state.builds.push([bullet]);
        }
    }
    state.objects.push(bullets);
}

function renderHTMLSlide(slide) {
    const html =
        state.svg.append("foreignObject")
                 .attr("x", 0)
                 .attr("y", 0)
                 .attr("width", "100%")
                 .attr("height", "100%");
    html.append("xhtml:div")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .style("background-color", slide.backgroundColor)
        .style("zoom", "220%")
        .style("margin", 0)
        .style("position", "absolute")
        .style("height", "100%")
        .style("width", "100%")
        .html(slide.content || "");
    state.objects.push(html);
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

function transitionCall(transition, attrs, style) {
    for (let key in attrs)
        transition.attr(key, attrs[key]);
    for (let key in style)
        transition.style(key, style[key]);
}

function renderObjects(slide, transitioners) {
    state.references = {};
    for (let i = 0; i < slide.objects.length; i++) {
        const object = slide.objects[i];

        // Check if object has id, should be transitioned, and isn't a later build
        if (object.id !== undefined
            && transitioners[object.id] !== undefined
            && (object.build === undefined || object.build === false)) {

            // Transition object from previous slide
            const obj = transitioners[object.id].object;
            const transition =
                d3.transition()
                  .duration(transitioners[object.id].transition_length)
                  .ease(d3.easeLinear);
            obj.transition(transition).call(transitionCall, object.attrs, object.style);
        } else {

            let obj = null;

            if (object.type === "html") {

                // Create HTML object
                obj =
                    state.svg.append("foreignObject")
                             .attr("x", object.attrs.x)
                             .attr("y", object.attrs.y)
                             .attr("height", object.attrs.height)
                             .attr("width", object.attrs.width);
                obj.append("xhtml:div")
                   .attr("xmlns", "http://www.w3.org/2000/svg")
                   .style("background-color", object.style.fill)
                   .style("zoom", object.style.zoom)
                   .style("margin", 0)
                   .style("position", "absolute")
                   .style("height", "100%")
                   .style("width", "100%")
                   .html(object.content || "");

            } else {

                // Create non-HTML object
                obj = state.svg.append(object.type);
                for (let key in object.attrs) {
                    obj.attr(key, object.attrs[key]);
                }
                for (let key in object.style) {
                    obj.style(key, object.style[key]);
                }
                if (object.text !== undefined) {
                    for (let i = 0; i < object.text.length; i++) {
                        obj.append("tspan")
                           .attr("x", object.attrs.x)
                           .attr("dy", parseInt(object.attrs["font-size"]) + 5)
                           .text(object.text[i]);
                    }
                }
            }

            // Check if object should be built later
            if (object.build) {
                obj.attr("display", "none");
                if (object.build === true) {
                    state.builds.push([obj]);
                } else if (state.builds[object.build] === undefined) {
                    state.builds[object.build] = [obj];
                } else {
                    state.builds[object.build].push(obj);
                }
            }

            // Record reference to object if identified
            if (object.id !== undefined) {
                state.references[object.id] = {
                    object: obj,
                    transition_length: object.transition_length
                };
            }
            state.objects.push(obj);
        }
    }
}
