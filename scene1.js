// Scene 1: Economic Development Trends
function createScene1(data) {
    // Data processing for Scene 1
    let scene1Data = data.filter(d => 
        !isNaN(+d["Year"]) &&  // Check if "Year" is a valid number
        !isNaN(+d["GDP per capita (current US$)"]) && // Check if "GDP per capita" is a valid number
        d["GDP per capita (current US$)"].trim() !== "" &&
        d["Region"].trim() !== ""
    );

    // Remove commas from numerical fields before parsing
    scene1Data.forEach(d => {
        d["GDP per capita (current US$)"] = +d["GDP per capita (current US$)"].replace(/,/g, "");
        // You can add more fields that require parsing here
    });

    // Create a container for Scene 1
    const scene1Container = d3.select("#scene1");

    // Add code to create a line chart visualizing GDP per capita trends by region
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = scene1Container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // X scale and axis
    const xScale = d3.scaleLinear()
        .domain(d3.extent(scene1Data, d => +d["Year"]))
        .range([0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    // Y scale and axis
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(scene1Data, d => +d["GDP per capita (current US$)"])])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Line generator
    const line = d3.line()
        .x(d => xScale(+d["Year"]))
        .y(d => yScale(+d["GDP per capita (current US$)"]));

    // Group data by region
    const nestedData = d3.rollups(scene1Data, v => v, d => d["Region"]);

    // Add lines for each region
    const lineColors = d3.scaleOrdinal(d3.schemeCategory10);

    svg.selectAll(".line")
        .data(nestedData)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(d[1]))
        .style("stroke", d => lineColors(d[0]))
        .style("fill", "none");

    // Legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width - 100) + "," + 20 + ")");

    const legendRect = legend.selectAll(".legend-rect")
        .data(nestedData)
        .enter()
        .append("rect")
        .attr("class", "legend-rect")
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", d => lineColors(d[0]));

    const legendText = legend.selectAll(".legend-text")
        .data(nestedData)
        .enter()
        .append("text")
        .attr("class", "legend-text")
        .attr("x", 20)
        .attr("y", (d, i) => i * 20 + 10)
        .text(d => d[0]);

    // For demonstration purposes, let's add a title to Scene 1
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Scene 1: Economic Development Trends");

    // Print scene1Data to the console (for debugging purposes)
    console.log(scene1Data);

    const rowsWithNaN = scene1Data.filter(d => isNaN(d["Year"]) || isNaN(d["GDP per capita (current US$)"]));
    console.log("Rows with NaN values:", rowsWithNaN);

}