class PolygonEditor {
    constructor(svg, controls, list) {
        this.svg = svg;
        this.controls = controls;
        this.list - list;
        this.polygon = new Polygon(svg);

        this.setControlsListener();
    }

    getTemporary() {
        const temps = document.querySelectorAll("polygon.temporary");
        const result = Array.from(temps).map((item) => {
            return item.getAttribute("points");
        });

        return JSON.stringify(result);
    }

    createListItem() {
        const wrapper = document.createElement("div");
        div.setAttribute("class", "mango");
        const desc = document.createElement("div");
        desc.innerHTML = "";
        wrapper.appendChild(desc);
        const remove = document.createElement("div");
        remove.innerHTML = "remove";
        wrapper.appendChild(remove);

        return wrapper;
    }

    setControlsListener() {
        this.controls.addEventListener("click", () => this.polygon.draw());
    }
}

class Polygon {
    constructor(svg, keepDrawing = true) {
        this.svg = svg;
        this.viewBox = svg.viewBox.baseVal;
        this.image = svg.querySelector("image");
        this.keepDrawing = keepDrawing;
        svg.addEventListener("mousedown", (e) => {
            if (e.detail > 1) {
                e.preventDefault();
            }
        });
    }

    draw() {
        if (this.polyline) {
            return;
        }
        this.polyline = this.createSVGElement("polyline");
        this.svg.appendChild(this.polyline);

        this.previewLine = this.createSVGElement("line");
        this.svg.appendChild(this.previewLine);

        this.createHandler = (e) => this.polylineOnClick(e);
        this.finishHandler = (e) => this.finishOnRightClick(e);
        this.previewLineHandler = (e) => this.previewOnMove(e);
        this.image.addEventListener("click", this.createHandler);
        this.image.addEventListener("contextmenu", this.finishHandler);
        this.previewLine.addEventListener("contextmenu", this.finishHandler);
        this.image.addEventListener("mousemove", this.previewLineHandler);
    }

    polylineOnClick(e) {
        const p = this.calculateCoords(e);
        this.lastPoint = p;
        let points = this.polyline.getAttribute("points");
        points += `${p.x},${p.y} `;
        this.polyline.setAttribute("points", points);
        this.previewOnMove(e);
    }

    previewOnMove(e) {
        if (!this.lastPoint) return;

        const p = this.calculateCoords(e);
        this.previewLine.setAttribute("x1", this.lastPoint.x);
        this.previewLine.setAttribute("y1", this.lastPoint.y);
        this.previewLine.setAttribute("x2", p.x);
        this.previewLine.setAttribute("y2", p.y);
        this.previewLine.setAttribute("stroke-dasharray", 2);
    }

    finishOnRightClick(e) {
        e.preventDefault();
        this.image.removeEventListener("click", this.createHandler);
        this.image.removeEventListener("contextmenu", this.finishHandler);
        this.previewLine.removeEventListener("contextmenu", this.finishHandler);
        this.image.removeEventListener("mousemove", this.previewLineHandler);
        this.previewLine.remove();
        this.isDrawing = false;
        this.polylineIntoPolygon();
        if (this.sideEffectFn) {
            this.sideEffectFn();
        }
        if (this.keepDrawing) {
            this.draw();
        }
        return false;
    }

    polylineIntoPolygon() {
        this.polygon = this.createSVGElement("polygon");
        this.polygon.setAttribute(
            "points",
            this.polyline.getAttribute("points").trim()
        );
        this.polygon.setAttribute("class", "temporary");
        this.svg.querySelector("#holds").appendChild(this.polygon);
        this.polyline.remove();
        this.polyline = null;
        this.lastPoint = null;
    }

    calculateCoords(e) {
        const bounds = this.image.getBoundingClientRect();
        const x = e.x - bounds.x;
        const y = e.y - bounds.y;
        return this.scaleToViewBox({ x, y }, bounds, this.viewBox);
    }

    scaleToViewBox(point, bounds, viewBox) {
        let x = Math.round((point.x / bounds.width) * viewBox.width);
        let y = Math.round((point.y / bounds.height) * viewBox.height);

        return { x, y };
    }

    createSVGElement(type) {
        const polygon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            type
        );
        polygon.setAttribute("points", "");
        polygon.setAttribute("stroke", "black");
        polygon.setAttribute("fill", "none");

        return polygon;
    }
}

const svg = document.querySelector("#editor-svg");
const controls = document.querySelector("#editor-controls");
const list = document.querySelector("#editor-list");

let editor = new PolygonEditor(svg, controls, list);
console.log(editor);
