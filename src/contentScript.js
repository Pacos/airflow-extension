const defaultHighlightStyle = "background: lightgoldenrodyellow; font-weight: bold;";
var currentBrowser = typeof InstallTrigger !== "undefined" ? browser : chrome;

const title = document.getElementsByTagName("title");

if (title && title[0] && title[0].innerText && title[0].innerText.match(/Airflow/gi)) {
    // Load dags to highlight them
    currentBrowser.storage.sync.get("dags", function (data) {
        if (data.dags) {
            currentBrowser.storage.sync.get("highlightStyle", function (style) {
                highlightDags(data.dags, style.highlightStyle ? style.highlightStyle : defaultHighlightStyle);
            });
        }
    });

    // Airlfow Navbar prod color
    currentBrowser.storage.sync.get("prodUrl", function (data) {
        colorNavBar(data.prodUrl);
    });

    // Airlfow Navbar staging color
    currentBrowser.storage.sync.get("stagingUrl", function (data) {
        colorNavBar(data.stagingUrl);
    });

    // Check if there is colorblind option
    currentBrowser.storage.sync.get("colors", function (data) {
        if (data.colors) {
            activateColorBlindMode(data.colors);
        }
    });
}

function highlightDags(dags, style) {
    let dagsElement = document.getElementsByClassName("dags-table-body")[0]
    if (!dagsElement) return;
    for (let tr of dagsElement.children[0].children[1].children) {
        for (let dag of dags) {
            if (tr.children[1].innerText.includes(dag)) {
                tr.setAttribute("style", style);
                break;
            }
        }
    }
}

function colorNavBar(data) {
    for (let url of data.urls) {
        if (url === location.host) {
            document
                .getElementsByClassName("navbar")[0]
                .setAttribute("style", "background-color: " + data.color + "!important");
            document
                .getElementsByClassName("active")[0]
                .children[0].setAttribute("style", "background-color: #00000020");
            break;
        }
    }
}

function activateColorBlindMode(colors) {
    const style = document.createElement("style");
    document.head.appendChild(style);

    let styleSheet = style.sheet;

    const dict = {};

    for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        styleSheet.insertRule("rect." + color.state + " {fill: " + color.color + "}", 0);
        styleSheet.insertRule("g.node." + color.state + " rect {stroke: " + color.color + "}", 0);
        styleSheet.insertRule("span[data-state=\""+ color.state + "\"] {border-color: " + color.color + " !important}", 0)
        dict[color.state] = color.color;
    }

    colorCircles(dict, 0);
}

function colorCircles(dict, n) {
    const circles = document.getElementsByTagName("circle");

    for (let i = 0; i < circles.length; i++) {
        const circle = circles[i];

        const title = circle.getAttribute("data-original-title");
        if (title && dict[title]) {
            circle.setAttribute("stroke", dict[title]);
        }
    }

    if (n < 20) {
        setTimeout(function () {
            colorCircles(dict, n + 1);
        }, 500);
    }
}

function getAirflowVersion() {
    var versionLine = document.getElementsByTagName("footer")[0].outerText.split('\n')[0];
    var versionRegex = "[1-9].[1-9].[1-9]";
    var version = versionLine.match(versionRegex)[0];
    return version;
}
