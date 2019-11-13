var renderRectangle = function (x1, y1, x2, y2, color) {
    // Swap around coords if needed.
    if (x1 > x2) {
        [x1, x2] = [x2, x1];
    }
    if (y1 > y2) {
        [y1, y2] = [y2, y1];
    }

    svg.append("rect")
        .attr("x", x1).attr("y", y1)
        .attr("width", x2 - x1).attr("height", y2 - y1)
        .attr("fill", color)
        .attr("stroke", color);

}

var clearSvg = function () {
    svg.selectAll("*").remove();
}

var clearSvgPath = function () {
    svg.selectAll("line").remove();
}


var renderCircle = function (x, y, radius, color) {
    svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', radius)
        .attr('stroke', color)
        .attr('fill', color);

}

var renderText = function (text, x, y, font_size, color) {
    svg.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-family", "sans-serif")
        .attr("font-size", font_size)
        .attr("fill", color)
        .text(text);


}

var renderPolygon = function (coords, color) {
    console.log(coords);
    console.log(color);

    let polyPoints = "";

    coords.forEach((pair, index) => {
        polyPoints += pair[0] + "," + pair[1] + " ";
    })


    svg.append("polygon").attr("points", polyPoints)
        .style("fill", color)
        .style("stroke", color);

}


var addCities = function(citiesInput) {
    var lines = citiesInput.split(/\r?\n/);
    
    // Clear previous memory
    cities.splice(0,cities.length)
    lines.forEach((line, index) => {
            if (line) {
                let line_ = line.replace(/\s+/g, ' ').trim();
                let split = line_.split(" ");
                let x = parseInt(split[0]);
                let y = parseInt(split[1]);
                cities.push([x, y]);
                renderCircle(x, y, 3, "black");
            }
    }) 

}


var updateStatus = function() {
    d3.select("#legalpath").text(String(isPathLegal));
    d3.select("#totaldist").text(String(totalDistance.toFixed(4)));
}

var euclideanDist = function(x1,y1,x2,y2) {
    return Math.sqrt(Math.pow((x1-x2), 2) + Math.pow((y1-y2),2));
}

var addPath = function(pathInput) {
    var lines = pathInput.split(/\r?\n/);
    
    // Clear previous memory
    path.splice(0,path.length)


    clearSvgPath();
    lines.forEach((line, index) => {
            if (line) {
                let p = parseInt(line);
                path.push(p);
            }
    })

    if (path.length > 0) {
        // Check if path is legal
        let citiesCount = cities.length;
        let pathSet = new Set(path);
        /*
        console.log(pathSet.size);
        console.log(path.length);
        console.log(citiesCount);
        console.log(path);
        console.log(Math.min(...path));
        console.log(Math.max(...path));
        */
        // Check if every city is included within the path
        if (pathSet.size === path.length && pathSet.size === citiesCount && Math.min(...path) === 0 && Math.max(...path) === citiesCount-1)  {
            isPathLegal = true;
        } else {
            isPathLegal = false;
        }
        
        // Render path
        let distance = 0;
        for (i = 0; i < path.length - 1; i++) {
            let lineX1 = cities[path[i]][0];
            let lineY1 = cities[path[i]][1];
            let lineX2 = cities[path[i+1]][0];
            let lineY2 = cities[path[i+1]][1];
            renderLine(lineX1, lineY1, lineX2, lineY2, 1.5, "black");
            distance += euclideanDist(lineX1, lineY1, lineX2, lineY2);
        }
        // Add line back to start
        let start = cities[path[0]];
        let end = cities[path[path.length-1]];
        distance += euclideanDist(end[0], end[1], start[0], start[1]);
        renderLine(end[0], end[1], start[0], start[1], 1.5, "black");        
        totalDistance = distance;

    } else {
        isPathLegal = false;
    }
    updateStatus();


}



var renderShapes = function (data) {
    var lines = data.split(/\r?\n/);

    lines.forEach((line, index) => {
        if (line) {
            let line_new = line.replace(/\s+/g, ' ').trim();

            let split = line_new.split(" ");
            let shape = split[0];
            if (shape === "rectangle") {
                console.log("It's a rectangle");
                let x1_coord = parseInt(split[1]);
                let y1_coord = parseInt(split[2]);
                let x2_coord = parseInt(split[3]);
                let y2_coord = parseInt(split[4]);
                let color = split[5];

                renderRectangle(x1_coord, y1_coord, x2_coord, y2_coord, color);
            } else if (shape === "circle") {
                console.log("It's a circle");
                let x_coord = parseInt(split[1]);
                let y_coord = parseInt(split[2]);
                let radius = parseInt(split[3]);
                let color = split[4];
                renderCircle(x_coord, y_coord, radius, color);
            } else if (shape === "line") {
                console.log("It's a line");
                let x1_coord = parseInt(split[1]);
                let y1_coord = parseInt(split[2]);
                let x2_coord = parseInt(split[3]);
                let y2_coord = parseInt(split[4]);
                let width = parseInt(split[5]);
                let color = split[6];
                renderLine(x1_coord, y1_coord, x2_coord, y2_coord, width, color);
            } else if (shape === "polygon") {
                let coords = new Array();
                let coord_count = split.length / 2 - 1
                for (i = 0; i < coord_count; i++) {
                    coords.push([parseInt(split[i * 2 + 1]), parseInt(split[i * 2 + 2])]);
                }

                let color = split[split.length - 1]

                renderPolygon(coords, color);
            } else if (shape === "text") {
                // Find text by ", split the remaining.
                text_start = line.indexOf('"');
                text_end = line.indexOf('"', text_start + 1);
                let text = line.slice(text_start + 1, text_end);
                remaining = line.slice(text_end + 2);
                remaining = remaining.replace(/\s+/g, ' ').trim();

                splits = remaining.split(" ");
                let x1_coord = parseInt(splits[0]);
                let y1_coord = parseInt(splits[1]);
                let font_size = parseInt(splits[2]);
                let color = splits[3];

                renderText(text, x1_coord, y1_coord, font_size, color);

            }


        }
    })
}


var renderLine = function (x1, y1, x2, y2, width, color) {
    svg.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2)
        .attr("stroke-width", width).attr("stroke", color);

}

var renderPath = function (data) {
    // Draw all points in file
    var lines = data.split(/\r?\n/);

    var line_coords = new Array();

    lines.forEach((line, index) => {
        if (line) {
            let coords = line.split(" ").map(Number);
            line_coords.push(coords);
        }
    })

    for (i = 0; i < line_coords.length - 1; i++) {
        svg.append("line").attr("x1", line_coords[i][0])
            .attr("y1", line_coords[i][1])
            .attr("x2", line_coords[i + 1][0])
            .attr("y2", line_coords[i + 1][1])
            .attr("stroke-width", 2).attr("stroke", "red");
    }


}

var cities = new Array();
var path = new Array();
var isPathLegal = false;
var totalDistance = 0;


var fieldWidth = d3.select("#width-input").node().value;
var fieldHeight = d3.select("#height-input").node().value;
var viewBoxHeight = fieldHeight / 0.6; // 0.6 == 600 / 1000
var viewBoxWidth = fieldWidth / 0.6;


// create svg element:
var svg = d3.select("#svg")
    .append("svg")
    .attr("viewBox", "0 0 " + String(Math.ceil(viewBoxWidth)) + " " + String(Math.ceil(viewBoxHeight)))
    .attr("width", fieldWidth)
    .attr("height", fieldHeight)
    .attr("preserveAspectRatio", "none");


var updateVariables = function () {
    fieldWidth = d3.select("#width-input").node().value;
    fieldHeight = d3.select("#height-input").node().value;

    if (fieldWidth > 600) {
        viewBoxHeight = Math.ceil(fieldHeight / (600.0 / fieldHeight));
        viewBoxWidth = Math.ceil(fieldWidth / (600.0 / fieldWidth));
        svg.style("border", "none");
        d3.selectAll(".viscontainer").style("border", "dotted");
    } else {
        viewBoxHeight = fieldWidth;
        viewBoxWidth = fieldHeight;
        console.log(d3.selectAll("viscontainer"));
        svg.style("border", "dotted");
        d3.selectAll(".viscontainer").style("border", "none");


    }

    console.log(viewBoxHeight, viewBoxWidth, fieldHeight, fieldWidth);

    // modify svg element
    svg
        .attr("viewBox", "0 0 " + String(viewBoxWidth) + " " + String(viewBoxHeight))
        .attr("width", fieldWidth)
        .attr("height", fieldHeight);
}




d3.select("#download")
    .on('click', function () {
        // Get the d3js SVG element and save using saveSvgAsPng.js
        

        saveSvgAsPng(document.getElementsByTagName("svg")[0], "plot.png", {
            scale: 1,
            backgroundColor: "#FFFFFF", width: fieldWidth, height: fieldHeight,
            encoderOptions: 1
        });
    })

d3.select("#updatefield")
    .on('click', function () {
        console.log("Updating field..");
        clearSvg();
        updateVariables();
    })

d3.select("#addcities")
    .on('click', function () {
        // Get all shapes described in the textarea and add them to the image
        var citiesInput = d3.select("#citiesarea").node().value;
        clearSvg();
        addCities(citiesInput);

    })

d3.select("#addpath")
    .on('click', function () {
        // Get all shapes described in the textarea and add them to the image
        var pathInput = d3.select("#orderarea").node().value;
        addPath(pathInput);

})

d3.select("#clearsvg")
    .on('click', function () {
        // Get all shapes described in the textarea and add them to the image
        clearSvg();

    })

d3.select("#file-input").attr("accept", "text/plain").on("change", function () {
    var file = d3.event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onloadend = function (event1) {
            console.log(event1);
            var data = event1.target.result;
            renderPath(data);
        };
        reader.readAsText(file);
    }
})


d3.select("#coverage-input").attr("accept", "text/plain").on("change", function () {
    var file = d3.event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onloadend = function (event1) {
            console.log(event1);
            var data = event1.target.result;
            renderCoverage(data, fieldWidth, fieldHeight);
        };
        reader.readAsText(file);
    }
})

