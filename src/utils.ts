export function updateSize(split: HTMLDivElement, size: number | string = "50%") {
    const staticPanel = split.children[0] as HTMLDivElement;
    const data = typeof size === "number" ? `${size}px` : size;

    if (split.classList.contains("column")) {
        staticPanel.style.height = data;
        staticPanel.style.width = "";
    } else {
        staticPanel.style.width = data;
        staticPanel.style.height = "";
    }

    const siblingPanel = split.children[1] as HTMLDivElement;
    siblingPanel.style.width = "";
    siblingPanel.style.height = "";
}

export function getRelativePosition(e: MouseEvent, element: HTMLElement) {
    const rect = element.getBoundingClientRect();

    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

export function detectDockZone(e: MouseEvent, panel: HTMLElement, threshold = 0.35) {
    const rect = panel.getBoundingClientRect();

    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    if (relX < threshold) return "left";
    if (relX > 1 - threshold) return "right";
    if (relY < threshold) return "top";
    if (relY > 1 - threshold) return "bottom";

    return "center";
}

export function swapPanels(split: HTMLDivElement) {
    const staticPanel = split.children[0] as HTMLDivElement;
    const staticPanelWidth = staticPanel.style.width;
    const staticPanelHeight = staticPanel.style.height;

    const dynamicPanel = split.children[1] as HTMLDivElement;

    staticPanel.style.width = "";
    staticPanel.style.height = "";

    dynamicPanel.style.width = staticPanelWidth;
    dynamicPanel.style.height = staticPanelHeight;

    split.appendChild(staticPanel);
}
