import { DRAG } from "../const";
import { detectDockZone, getRelativePosition, swapPanels, updateSize } from "../utils";

let draggingPanel: HTMLDivElement = null;

document.addEventListener("mousedown", (e) => {
    const target = e.target as HTMLDivElement;
    if (!target.classList.contains("panel")) return;

    const data = getRelativePosition(e, target);
    if (data.x > DRAG || data.y > DRAG) return;

    draggingPanel = target;
    document.body.style.cursor = "move";
});

document.addEventListener("mouseup", (e) => {
    if (!draggingPanel) return;
    document.body.style.cursor = "";

    const master = draggingPanel.closest(".master") as HTMLDivElement;
    const allPanels = [...master.querySelectorAll(".panel")].filter(
        p => p !== draggingPanel
    );

    const elemUnder = document.elementFromPoint(e.clientX, e.clientY);

    if (!elemUnder) {
        draggingPanel = null;
        return;
    }

    const targetPanel = (elemUnder as HTMLElement).closest(".panel") as HTMLDivElement | null;

    if (!targetPanel) {
        draggingPanel = null;
        return;
    }

    if (!allPanels.includes(targetPanel)) {
        draggingPanel = null;
        return;
    }

    function end() {
        draggingPanel = null;
    }

    /**
     * <div id="app" class="master split row">
     *      <div class="panel base" style="width: 50%;">panel1</div>     targetPanel
     *      <div class="panel">
     *          <div class="split column">
     *              <div class="panel base" style="height: 50%;">panel2</div>
     *              <div class="panel base">panel3</div>     draggingPanel
     *          </div>
     *      </div>
     *  </div>
     */

    targetPanel.parentElement.dataset.id = "ny-id";
    const zone = detectDockZone(e, targetPanel);

    if (zone === "center") {
        end();
        return;
    }

    const siblingPanel = [...draggingPanel.parentElement!.children].find(el => el !== draggingPanel) as HTMLDivElement;
    siblingPanel.style.width = "";
    siblingPanel.style.height = "";
    targetPanel.parentElement.replaceChild(draggingPanel.parentElement.parentElement, targetPanel);

    const nyID = qs("ny-id", 1);
    nyID.appendChild(siblingPanel);
    nyID.dataset.id = "";

    draggingPanel.parentElement.appendChild(targetPanel);

    /**
     * <div id="app" class="master split row">
     *      <div class="panel" style="width: 50%;">
     *          <div class="split row">
     *              <div class="panel base" style="width: 50%;">panel3</div>  draggingPanel
     *              <div class="panel base">panel1</div>         targetPanel
     *          </div>
     *      </div>
     *      <div class="panel base">panel2</div>
     *  </div>
     */

    targetPanel.style.width = "";
    targetPanel.style.height = "";

    const newSplitContainer = draggingPanel.parentElement as HTMLDivElement;
    if (!newSplitContainer) return end();

    const columnType = zone === "left" || zone === "right";
    newSplitContainer.classList.toggle("column", !columnType);
    newSplitContainer.classList.toggle("row", columnType);
    updateSize(draggingPanel.parentElement as HTMLDivElement);

    if (zone === "right" || zone === "bottom")
        swapPanels(newSplitContainer);

    const newSplitPanel = newSplitContainer.parentElement as HTMLDivElement;

    if (!newSplitPanel) return end();

    newSplitPanel.style.width = "50%";
    newSplitPanel.style.height = "";

    end();
});