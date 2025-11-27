import logger from "./logger";

export type SplitType = "row" | "column";

export function createPanel(basePanel = true) {
    const div = document.createElement("div");
    div.classList.add("panel");
    if (basePanel) div.classList.add("base");
    logger.debug(`Panel created with basePanel=${basePanel}`);
    return div;
}

export function createSplit(type: SplitType) {
    const div = document.createElement("div");
    div.classList.add("split");
    div.classList.add(type);
    logger.debug(`Split created with type=${type}`);
    return div;
}

export function panel2Split(replacedPanel: HTMLDivElement, newPanel: HTMLDivElement, type: SplitType) {
    logger.info(`Splitting panel with type=${type}`);
    const splitPanel = createPanel(false);
    const split = createSplit(type);

    const parentElement = replacedPanel.parentElement as HTMLDivElement;
    splitPanel.appendChild(split);
    parentElement.replaceChild(splitPanel, replacedPanel);

    split.appendChild(replacedPanel);
    split.appendChild(newPanel);

    return split;
}