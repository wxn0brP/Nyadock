import "@wxn0brp/flanker-ui/html";
import { createPanel, panel2Split } from "./createPanel";
import "./mouse";
import { updateSize } from "./utils";

const app = qs("#app");

const panel1 = createPanel();
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
app.appendChild(panel1);

const panel2 = createPanel();
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
app.appendChild(panel2);

updateSize(app);

const panel3 = createPanel();
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

updateSize(panel2Split(panel2, panel3, "column"));