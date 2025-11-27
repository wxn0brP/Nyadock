import { DRAG } from "../const";
import { detectDockZone, getRelativePosition, swapPanels, updateSize, updateStaticPanelSize } from "../utils";
import logger from "../logger";

let draggingPanel: HTMLDivElement = null;

document.addEventListener("mousedown", (e) => {
    logger.debug("mousedown event triggered");
    const target = e.target as HTMLDivElement;
    if (!target.classList.contains("panel")) {
        logger.debug("Mousedown event ignored: target is not a panel");
        return;
    }

    const data = getRelativePosition(e, target);
    if (data.x > DRAG || data.y > DRAG) {
        logger.debug("Mousedown event ignored: not in drag area");
        return;
    }

    draggingPanel = target;
    logger.info("Dragging panel started", draggingPanel);
    document.body.style.cursor = "move";
});

document.addEventListener("mouseup", (e) => {
    logger.debug("mouseup event triggered");
    if (!draggingPanel) {
        logger.debug("Mouseup event ignored: no panel is being dragged");
        return;
    }
    document.body.style.cursor = "";

    function end() {
        logger.info("Dragging finished");
        draggingPanel = null;
    }

    const master = draggingPanel.closest(".master") as HTMLDivElement;
    const allPanels = [...master.querySelectorAll(".panel")].filter(
        p => p !== draggingPanel
    );
    logger.debug("All panels", allPanels);

    const elemUnder = document.elementFromPoint(e.clientX, e.clientY);

    if (!elemUnder) {
        logger.debug("Mouseup event ignored: no element under cursor");
        return end();
    }

    const targetPanel = (elemUnder as HTMLElement).closest(".panel") as HTMLDivElement | null;
    if (!targetPanel) {
        logger.debug("Mouseup event ignored: no target panel under cursor");
        return end();
    }
    logger.debug("Target panel", targetPanel);

    if (!allPanels.includes(targetPanel)) {
        logger.debug("Mouseup event ignored: target panel is not a valid drop target");
        return end();
    }

    /**
     * <div id="app" class="master split row">
     *      <div class="panel base" style="width: 50%;">panel1</div>            targetPanel
     *      <div class="panel">
     *          <div class="split column">
     *              <div class="panel base" style="height: 50%;">panel2</div>   siblingPanel
     *              <div class="panel base">panel3</div>                        draggingPanel
     *          </div>
     *      </div>
     *  </div>
     */

    const zone = detectDockZone(e, targetPanel);
    logger.info(`Docking to ${zone}`);
    if (zone === "center") {
        logger.debug("Docking to center, no action taken");
        return end();
    }

    if (draggingPanel.parentElement.classList.contains("master")) {
        logger.debug("Dragging panel is a direct child of master");
        const typeRow = draggingPanel.parentElement.classList.contains("row");
        draggingPanel.parentElement.classList.toggle("row", !typeRow);
        draggingPanel.parentElement.classList.toggle("column", typeRow);
        logger.debug("Toggled master split direction");

        const siblingPanel = [...targetPanel.parentElement!.children].find(el => el !== targetPanel) as HTMLDivElement;
        siblingPanel.style.width = "";
        siblingPanel.style.height = "";
        logger.debug("Reset sibling panel size");

        const draggingChildrenIndex = [...draggingPanel.parentElement.children].indexOf(draggingPanel);
        logger.debug("Dragging children index", draggingChildrenIndex);

        draggingPanel.parentElement.appendChild(siblingPanel);
        targetPanel.parentElement.appendChild(draggingPanel);
        logger.debug("Moved panels between containers");

        if (draggingChildrenIndex === 0) {
            swapPanels(siblingPanel.parentElement);
            logger.debug("Swapped panels in sibling container");
        }

        updateSize(siblingPanel.parentElement);
        logger.debug("Updated size of sibling container");

        const newSplitContainer = draggingPanel.parentElement;

        const columnType = zone === "left" || zone === "right";
        newSplitContainer.classList.toggle("column", !columnType);
        newSplitContainer.classList.toggle("row", columnType);
        logger.debug("Set new split container direction");

        if (zone === "left" || zone === "top") {
            swapPanels(newSplitContainer);
            logger.debug("Swapped panels in new split container");
        }

        updateSize(draggingPanel.parentElement);
        logger.debug("Updated size of new split container");

        return end();
    }

    logger.debug("Dragging panel is not a direct child of master");
    const siblingPanel = [...draggingPanel.parentElement!.children].find(el => el !== draggingPanel) as HTMLDivElement;
    siblingPanel.style.width = "";
    siblingPanel.style.height = "";
    logger.debug("Reset sibling panel size");

    targetPanel.parentElement.dataset.id = "ny-id-target";
    targetPanel.parentElement.replaceChild(draggingPanel.parentElement.parentElement, targetPanel);
    logger.debug("Replaced target panel with dragging panel's container");

    const nyID = qs("ny-id-target", 1);
    nyID.appendChild(siblingPanel);
    nyID.dataset.id = "";
    logger.debug("Appended sibling panel to the old target panel container");

    draggingPanel.parentElement.appendChild(targetPanel);
    logger.debug("Appended target panel to the dragging panel's new container");

    /**
     * <div id="app" class="master split row">
     *      <div class="panel" style="width: 50%;">
     *          <div class="split row">
     *              <div class="panel base" style="width: 50%;">panel3</div>    draggingPanel
     *              <div class="panel base">panel1</div>                        targetPanel
     *          </div>
     *      </div>
     *      <div class="panel base">panel2</div>                                siblingPanel
     *  </div>
     */

    targetPanel.style.width = "";
    targetPanel.style.height = "";
    logger.debug("Reset target panel size");

    const newSplitContainer = draggingPanel.parentElement;
    if (!newSplitContainer) return end();

    const columnType = zone === "left" || zone === "right";
    newSplitContainer.classList.toggle("column", !columnType);
    newSplitContainer.classList.toggle("row", columnType);
    logger.debug("Set new split container direction");
    updateSize(draggingPanel.parentElement);
    logger.debug("Updated size of new split container");

    if (zone === "right" || zone === "bottom") {
        swapPanels(newSplitContainer);
        logger.debug("Swapped panels in new split container");
    }

    const newSplitPanel = newSplitContainer.parentElement;
    if (!newSplitPanel) return end();

    updateStaticPanelSize(newSplitPanel);
    logger.debug("Updated static panel size of the new split panel");

    end();
});