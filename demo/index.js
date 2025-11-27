// node_modules/@wxn0brp/flanker-ui/dist/html.js
(() => {
  var f = Object.defineProperty;
  var a = (t, e) => f(t, "name", { value: e, configurable: true });
  var i = { html(t) {
    return t !== undefined ? (this.innerHTML = t, this) : this.innerHTML;
  }, v(t) {
    return t !== undefined ? (this.value = t, this) : this.value;
  }, on(t, e) {
    return this.addEventListener(t, e), this;
  }, css(t, e = null) {
    return typeof t == "string" ? e !== null ? this.style[t] = e : this.style.cssText = t : Object.assign(this.style, t), this;
  }, attrib(t, e = null) {
    return e !== null ? (this.setAttribute(t, e), this) : this.getAttribute(t) || "";
  }, clA(...t) {
    return this.classList.add(...t), this;
  }, clR(...t) {
    return this.classList.remove(...t), this;
  }, clT(t, e) {
    return this.classList.toggle(t, e), this;
  }, animateFade(t, e = {}) {
    let { time: n = 200, cb: s } = e, r = this, l = t === 0 ? 1 : 0, m = Math.min(1, Math.max(0, t)), u = performance.now();
    r.style.opacity = m.toString();
    function o(T) {
      let d = T - u, h = Math.min(d / n, 1), L = m + (l - m) * h;
      r.style.opacity = L.toString(), h < 1 ? requestAnimationFrame(o) : (r.style.opacity = l.toString(), s?.());
    }
    return a(o, "step"), requestAnimationFrame(o), this;
  }, fadeIn(...t) {
    let e = c({ display: "string", cb: "function", time: "number" }, t), { display: n = "block" } = e;
    return this.css("display", n), this.animateFade(0, e), this.fade = true, this;
  }, fadeOut(...t) {
    let e = c({ cb: "function", time: "number" }, t), n = e.time ?? 300;
    return e.time = n, this.animateFade(1, { ...e, cb: a(() => {
      this.css("display", "none"), e.cb?.();
    }, "cb") }), this.fade = false, this;
  }, async fadeInP(...t) {
    return new Promise((e) => {
      this.fadeIn(...t, () => e(this));
    });
  }, async fadeOutP(...t) {
    return new Promise((e) => {
      this.fadeOut(...t, () => e(this));
    });
  }, fade: true, fadeToggle() {
    return this.fade ? this.fadeOut() : this.fadeIn(), this;
  }, add(t) {
    return this.appendChild(t), this;
  }, addUp(t) {
    return this.insertBefore(t, this.firstChild), this;
  }, qs(t, e = 0) {
    return e && (t = `[data-id="${t}"]`), this.querySelector(t);
  }, qi(t, e = 0) {
    return this.qs(t, e);
  } };
  function c(t, e) {
    let n = {};
    if (e.length === 0)
      return n;
    if (e.every((s) => typeof s == "object"))
      return Object.assign({}, ...e);
    for (let s of e)
      for (let [r, l] of Object.entries(t))
        if (typeof s === l) {
          n[r] = s;
          break;
        }
    return n;
  }
  a(c, "convert");
  Object.assign(HTMLElement.prototype, i);
  Object.assign(document, i);
  Object.assign(document.body, i);
  Object.assign(document.documentElement, i);
  for (let t of ["qs", "qi"])
    typeof i[t] == "function" && (window[t] = function(...e) {
      return i[t].apply(document, e);
    });
})();

// src/logger.ts
var LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};
var logs = [];
var currentLogLevel = LOG_LEVELS.ERROR;
function setLogLevel(level) {
  currentLogLevel = LOG_LEVELS[level];
}
function exportLogs() {
  console.log(logs.join(`
`));
}
function log(level, ...args) {
  if (LOG_LEVELS[level] >= currentLogLevel) {
    console.log(`[${level}]`, ...args);
    logs.push(`[${level}] ${args.map((a) => typeof a === "string" ? a : JSON.stringify(a)).join(" ")}`);
  }
}
var logger = {
  debug: (...args) => log("DEBUG", ...args),
  info: (...args) => log("INFO", ...args),
  warn: (...args) => log("WARN", ...args),
  error: (...args) => log("ERROR", ...args),
  setLogLevel,
  exportLogs
};
var logger_default = logger;

// src/createPanel.ts
function createPanel(basePanel = true) {
  const div = document.createElement("div");
  div.classList.add("panel");
  if (basePanel)
    div.classList.add("base");
  logger_default.debug(`Panel created with basePanel=${basePanel}`);
  return div;
}
function createSplit(type) {
  const div = document.createElement("div");
  div.classList.add("split");
  div.classList.add(type);
  logger_default.debug(`Split created with type=${type}`);
  return div;
}
function panel2Split(replacedPanel, newPanel, type) {
  logger_default.info(`Splitting panel with type=${type}`);
  const splitPanel = createPanel(false);
  const split = createSplit(type);
  const parentElement = replacedPanel.parentElement;
  splitPanel.appendChild(split);
  parentElement.replaceChild(splitPanel, replacedPanel);
  split.appendChild(replacedPanel);
  split.appendChild(newPanel);
  return split;
}

// src/const.ts
var DRAG = 30;
var RESIZE_MIN = 100;

// src/utils.ts
function updateSize(split, size = "50%") {
  logger_default.debug(`Updating size of split to ${size}`);
  const staticPanel = split.children[0];
  updateStaticPanelSize(staticPanel, size);
  const siblingPanel = split.children[1];
  siblingPanel.style.width = "";
  siblingPanel.style.height = "";
}
function updateStaticPanelSize(panel, size = "50%") {
  logger_default.debug(`Updating static panel size to ${size}`);
  const split = panel.parentElement;
  const data = typeof size === "number" ? `${size}px` : size;
  if (split.classList.contains("column")) {
    panel.style.height = data;
    panel.style.width = "";
  } else {
    panel.style.width = data;
    panel.style.height = "";
  }
}
function getRelativePosition(e, element) {
  const rect = element.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}
function detectDockZone(e, panel, threshold = 0.35) {
  const rect = panel.getBoundingClientRect();
  const relX = (e.clientX - rect.left) / rect.width;
  const relY = (e.clientY - rect.top) / rect.height;
  if (relX < threshold)
    return "left";
  if (relX > 1 - threshold)
    return "right";
  if (relY < threshold)
    return "top";
  if (relY > 1 - threshold)
    return "bottom";
  return "center";
}
function swapPanels(split) {
  logger_default.debug("Swapping panels");
  const staticPanel = split.children[0];
  const staticPanelWidth = staticPanel.style.width;
  const staticPanelHeight = staticPanel.style.height;
  const dynamicPanel = split.children[1];
  staticPanel.style.width = "";
  staticPanel.style.height = "";
  dynamicPanel.style.width = staticPanelWidth;
  dynamicPanel.style.height = staticPanelHeight;
  split.appendChild(staticPanel);
}

// src/mouse/movePanel.ts
var draggingPanel = null;
document.addEventListener("mousedown", (e) => {
  logger_default.debug("mousedown event triggered");
  const target = e.target;
  if (!target.classList.contains("panel")) {
    logger_default.debug("Mousedown event ignored: target is not a panel");
    return;
  }
  const data = getRelativePosition(e, target);
  if (data.x > DRAG || data.y > DRAG) {
    logger_default.debug("Mousedown event ignored: not in drag area");
    return;
  }
  draggingPanel = target;
  logger_default.info("Dragging panel started", draggingPanel);
  document.body.style.cursor = "move";
});
document.addEventListener("mouseup", (e) => {
  logger_default.debug("mouseup event triggered");
  if (!draggingPanel) {
    logger_default.debug("Mouseup event ignored: no panel is being dragged");
    return;
  }
  document.body.style.cursor = "";
  function end() {
    logger_default.info("Dragging finished");
    draggingPanel = null;
  }
  const master = draggingPanel.closest(".master");
  const allPanels = [...master.querySelectorAll(".panel")].filter((p) => p !== draggingPanel);
  logger_default.debug("All panels", allPanels);
  const elemUnder = document.elementFromPoint(e.clientX, e.clientY);
  if (!elemUnder) {
    logger_default.debug("Mouseup event ignored: no element under cursor");
    return end();
  }
  const targetPanel = elemUnder.closest(".panel");
  if (!targetPanel) {
    logger_default.debug("Mouseup event ignored: no target panel under cursor");
    return end();
  }
  logger_default.debug("Target panel", targetPanel);
  if (!allPanels.includes(targetPanel)) {
    logger_default.debug("Mouseup event ignored: target panel is not a valid drop target");
    return end();
  }
  const zone = detectDockZone(e, targetPanel);
  logger_default.info(`Docking to ${zone}`);
  if (zone === "center") {
    logger_default.debug("Docking to center, no action taken");
    return end();
  }
  if (draggingPanel.parentElement.classList.contains("master")) {
    logger_default.debug("Dragging panel is a direct child of master");
    const typeRow = draggingPanel.parentElement.classList.contains("row");
    draggingPanel.parentElement.classList.toggle("row", !typeRow);
    draggingPanel.parentElement.classList.toggle("column", typeRow);
    logger_default.debug("Toggled master split direction");
    const siblingPanel2 = [...targetPanel.parentElement.children].find((el) => el !== targetPanel);
    siblingPanel2.style.width = "";
    siblingPanel2.style.height = "";
    logger_default.debug("Reset sibling panel size");
    const draggingChildrenIndex = [...draggingPanel.parentElement.children].indexOf(draggingPanel);
    logger_default.debug("Dragging children index", draggingChildrenIndex);
    draggingPanel.parentElement.appendChild(siblingPanel2);
    targetPanel.parentElement.appendChild(draggingPanel);
    logger_default.debug("Moved panels between containers");
    if (draggingChildrenIndex === 0) {
      swapPanels(siblingPanel2.parentElement);
      logger_default.debug("Swapped panels in sibling container");
    }
    updateSize(siblingPanel2.parentElement);
    logger_default.debug("Updated size of sibling container");
    const newSplitContainer2 = draggingPanel.parentElement;
    const columnType2 = zone === "left" || zone === "right";
    newSplitContainer2.classList.toggle("column", !columnType2);
    newSplitContainer2.classList.toggle("row", columnType2);
    logger_default.debug("Set new split container direction");
    if (zone === "left" || zone === "top") {
      swapPanels(newSplitContainer2);
      logger_default.debug("Swapped panels in new split container");
    }
    updateSize(draggingPanel.parentElement);
    logger_default.debug("Updated size of new split container");
    return end();
  }
  logger_default.debug("Dragging panel is not a direct child of master");
  const siblingPanel = [...draggingPanel.parentElement.children].find((el) => el !== draggingPanel);
  siblingPanel.style.width = "";
  siblingPanel.style.height = "";
  logger_default.debug("Reset sibling panel size");
  targetPanel.parentElement.dataset.id = "ny-id-target";
  targetPanel.parentElement.replaceChild(draggingPanel.parentElement.parentElement, targetPanel);
  logger_default.debug("Replaced target panel with dragging panel's container");
  const nyID = qs("ny-id-target", 1);
  nyID.appendChild(siblingPanel);
  nyID.dataset.id = "";
  logger_default.debug("Appended sibling panel to the old target panel container");
  draggingPanel.parentElement.appendChild(targetPanel);
  logger_default.debug("Appended target panel to the dragging panel's new container");
  targetPanel.style.width = "";
  targetPanel.style.height = "";
  logger_default.debug("Reset target panel size");
  const newSplitContainer = draggingPanel.parentElement;
  if (!newSplitContainer)
    return end();
  const columnType = zone === "left" || zone === "right";
  newSplitContainer.classList.toggle("column", !columnType);
  newSplitContainer.classList.toggle("row", columnType);
  logger_default.debug("Set new split container direction");
  updateSize(draggingPanel.parentElement);
  logger_default.debug("Updated size of new split container");
  if (zone === "right" || zone === "bottom") {
    swapPanels(newSplitContainer);
    logger_default.debug("Swapped panels in new split container");
  }
  const newSplitPanel = newSplitContainer.parentElement;
  if (!newSplitPanel)
    return end();
  updateStaticPanelSize(newSplitPanel);
  logger_default.debug("Updated static panel size of the new split panel");
  end();
});

// node_modules/@wxn0brp/flanker-ui/dist/utils.js
function clamp(min, value, max) {
  return Math.min(Math.max(value, min), max);
}

// src/mouse/resize.ts
var draggingPanel2 = null;
var leftPanel = null;
var panelType = "width";
document.addEventListener("mousedown", (e) => {
  const target = e.target;
  if (!target.classList.contains("panel"))
    return;
  const _panelType = target.parentElement.classList.contains("column") ? "height" : "width";
  const _leftPanel = target.parentElement.children[0];
  const data = getRelativePosition(e, _leftPanel);
  if (_panelType === "width") {
    const delta = _leftPanel.offsetWidth - data.x;
    if (delta > DRAG || delta < 0)
      return;
  } else {
    const delta = _leftPanel.offsetHeight - data.y;
    if (delta > DRAG || delta < 0)
      return;
  }
  draggingPanel2 = target;
  leftPanel = _leftPanel;
  panelType = _panelType;
  logger_default.debug(`Resizing panel ${panelType}`);
  document.body.style.cursor = panelType === "width" ? "col-resize" : "row-resize";
});
document.addEventListener("mousemove", (e) => {
  if (!draggingPanel2)
    return;
  const data = getRelativePosition(e, leftPanel);
  let value = 0;
  if (panelType === "width")
    value = clamp(RESIZE_MIN, data.x, draggingPanel2.parentElement.offsetWidth - RESIZE_MIN);
  else
    value = clamp(RESIZE_MIN, data.y, draggingPanel2.parentElement.offsetHeight - RESIZE_MIN);
  logger_default.debug(`Resizing to ${value}`);
  updateSize(draggingPanel2.parentElement, value);
});
document.addEventListener("mouseup", (e) => {
  if (draggingPanel2)
    logger_default.debug("Resizing finished");
  draggingPanel2 = null;
  document.body.style.cursor = "";
});

// src/index.ts
logger_default.setLogLevel("DEBUG");
window.logger = logger_default;
var app = qs("#app");
var panel1 = createPanel();
panel1.innerHTML = `
    <div class="panel-header">Panel 1</div>
    <div class="panel-content">
        <h3>Welcome to Panel 1</h3>
        <p>This is the first panel in the layout.</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
        </ul>
    </div>
`;
var panel2 = createPanel();
panel2.innerHTML = `
    <div class="panel-header">Panel 2</div>
    <div class="panel-content">
        <h3>Content for Panel 2</h3>
        <p>This is the second panel, split from the main container.</p>
        <div class="button-group">
            <button>Button 1</button>
            <button>Button 2</button>
        </div>
    </div>
`;
var panel3 = createPanel();
panel3.innerHTML = `
    <div class="panel-header">Panel 3</div>
    <div class="panel-content">
        <h3>Additional Panel</h3>
        <p>This is the third panel in the layout.</p>
        <div class="info-box">
            <p>This panel was created by splitting with Panel 2.</p>
        </div>
    </div>
`;
var panel4 = createPanel();
panel4.innerHTML = `
    <div class="panel-header">Panel 4</div>
    <div class="panel-content">
        <h3>Form Panel</h3>
        <form>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name"><br><br>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email"><br><br>
            <input type="submit" value="Submit">
        </form>
    </div>
`;
var panel5 = createPanel();
panel5.innerHTML = `
    <div class="panel-header">Panel 5</div>
    <div class="panel-content">
        <h3>Table Panel</h3>
        <table border="1">
            <tr>
                <th>First name</th>
                <th>Last name</th>
                <th>Age</th>
            </tr>
            <tr>
                <td>Jill</td>
                <td>Smith</td>
                <td>50</td>
            </tr>
            <tr>
                <td>Eve</td>
                <td>Jackson</td>
                <td>94</td>
            </tr>
        </table>
    </div>
`;
app.appendChild(panel1);
app.appendChild(panel2);
updateSize(app);
updateSize(panel2Split(panel2, panel3, "column"));
updateSize(panel2Split(panel3, panel4, "row"));
updateSize(panel2Split(panel4, panel5, "column"));

//# debugId=64AFC9D0EA220A6264756E2164756E21
//# sourceMappingURL=index.js.map
