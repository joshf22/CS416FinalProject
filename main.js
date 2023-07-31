function createInteractiveSlideshow(data) {

    function createScene1(data) {
        // Data processing for Scene 1
        let scene1Data = data.filter(d =>
            !isNaN(parseFloat(d["GDP per capita (current US$)"].replace(/,/g, "")))
        );

        // Calculate the average GDP per capita for each region in 2017
        const regionData = d3.rollups(scene1Data, v => d3.mean(v, d => parseFloat(d["GDP per capita (current US$)"].replace(/,/g, ""))), d => d["Region"]);

        // Sort the regions based on average GDP per capita in ascending order
        regionData.sort((a, b) => a[1] - b[1]);

        // Define color scale for regions
        const colorScale = d3.scaleOrdinal()
            .domain(["North America", "South Asia", "East & Southeast Asia", "West Asia & North Africa", "Sub-Saharan Africa", "Europe", "Latin America & Caribbean", "Oceania", "Central Asia"])
            .range(["#9561e2", "#38c172", "#ffed4a", "#3490dc", "#e3342f", "#6574cd", "#f66d9b", "#f6993f", "#4dc0b5"]);

        // Adjusted margin and spacing for the chart
        const margin = { top: 50, right: 50, bottom: 100, left: 70 };
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select("#scene1")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add a background rectangle to create space for the axis labels
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "none")
            .attr("pointer-events", "all");

        // X scale and axis
        const xScale = d3.scaleBand()
            .domain(regionData.map(d => d[0]))
            .range([0, width])
            .padding(0.2);

        const xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-45)");

        // Y scale and axis
        const maxGDP = d3.max(regionData, d => d[1]);
        const yScale = d3.scaleLinear()
            .domain([0, maxGDP])
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Bars for each region
        svg.selectAll(".bar")
            .data(regionData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d[0]))
            .attr("y", d => yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d[1]))
            .attr("fill", d => colorScale(d[0]));

        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "24px") // Add a consistent title font size
            .text("Part 1: Average GDP per Capita by Region (2017)");
   
        // Remove the legend
        svg.select(".legend").remove();

            // Add a group element for the annotations
        // Add a group element for the annotations
        const annotationsGroup = svg.append("g");

        // Find data for the United States and Canada
        const usaData = scene1Data.find(d => d["Country Name"] === "United States");
        const canadaData = scene1Data.find(d => d["Country Name"] === "Canada");

        // Get the GDP per capita for the United States and Canada
        const usaGdpPerCapita = usaData["GDP per capita (current US$)"];
        const canadaGdpPerCapita = canadaData["GDP per capita (current US$)"];

        // Find the x position of the "West Asia & North Africa" bar to align the text box
        const westAsiaX = xScale("West Asia & North Africa");

        // Add a rectangle as a background for the text box
        const textBoxWidth = 180; // Width of the text box
        const textBoxHeight = 90; // Height of the text box
        const textBoxX = westAsiaX - textBoxWidth - 10; // Position the text box to the left of the bar
        const textBoxY = yScale(usaGdpPerCapita) - textBoxHeight / 2; // Position the text box vertically centered on the bar

        annotationsGroup.append("rect")
            .attr("class", "annotation-box")
            .attr("x", textBoxX)
            .attr("y", -2)
            .attr("width", textBoxWidth)
            .attr("height", textBoxHeight)
            .attr("fill", "#f0f0f0") // Light grey background color
            .attr("stroke", "#000");

        // Add a blurb of text inside the box with line breaks for wrapping
        const textLines = [
            `The United States has a GDP per capita of $${usaGdpPerCapita},`,
            `and Canada has a GDP per capita of $${canadaGdpPerCapita},`,
            `which are ranked ${regionData.length}th and 17th respectively.`,
        ];
        
        // Create a container for the text
        const textContainer = annotationsGroup
            .append("foreignObject")
            .attr("class", "annotation-text-container")
            .attr("x", textBoxX + 10) // Position the text inside the box with a 10px margin from the left
            .attr("y", 0) // Position the text with a 10px margin from the top
            .attr("width", textBoxWidth - 20) // Adjust the width to account for margins
            .attr("height", textBoxHeight - 25); // Adjust the height to account for margins
        
        // Append a div inside the container
        const textDiv = textContainer
            .append("xhtml:div")
            .attr("class", "annotation-text")
            .style("font-size", "12px")
            .style("font-style", "italic"); // Set the font style to italic;
            
        
        // Add the text lines to the div with line breaks
        textDiv.html(textLines.join("<br/>"));
        
        // Get the actual height of the text content
        const textHeight = textDiv.node().getBoundingClientRect().height;
        
        // Update the height of the rectangle to fit the text
        textContainer.attr("height", textHeight + 20); // Adding 20px to provide some extra padding
        
        // Find the x position of the "North America" bar
        const northAmericaX = xScale("North America") + xScale.bandwidth() / 2;

        // Find the y position of the "North America" bar
        const northAmericaY = yScale(regionData.find(d => d[0] === "North America")[1]);

        // Add a line connecting the text box to the "North America" bar
        annotationsGroup.append("line")
            .attr("class", "annotation-line")
            .attr("x1", textBoxX + textBoxWidth) // Position the starting point of the line at the right edge of the text box
            .attr("y1", northAmericaY + 40) // Position the starting point of the line vertically centered with the text box based on the text content height
            .attr("x2", northAmericaX) // Position the ending point of the line at the horizontal center of the "North America" bar
            .attr("y2", northAmericaY + 40) // Position the ending point of the line at the vertical center of the "North America" bar
            .attr("stroke", "#adadad");


    }
    function createScene2(data) {
        // Define color scale for regions (same as used in scenes 1 and 3)
        const colorScale = d3.scaleOrdinal()
          .domain(["North America", "South Asia", "East & Southeast Asia", "West Asia & North Africa", "Sub-Saharan Africa", "Europe", "Latin America & Caribbean", "Oceania", "Central Asia"])
          .range(["#9561e2", "#38c172", "#ffed4a", "#3490dc", "#e3342f", "#6574cd", "#f66d9b", "#f6993f", "#4dc0b5"]);
      
        // Data processing: calculate the total population for each region
        const regionData = d3.groups(data, d => d["Region"]);
        const totalPopulation = d3.sum(data, d => parseFloat(d["Population, total"].replace(/,/g, "")));
      
        // Calculate the percentage of the world's population for each region
        const pieData = regionData.map(region => {
          const regionName = region[0];
          const regionPopulation = d3.sum(region[1], d => parseFloat(d["Population, total"].replace(/,/g, "")));
          return {
            region: regionName,
            populationPercentage: (regionPopulation / totalPopulation) * 100
          };
        });
      
        // Adjusted margin and spacing for the pie chart
        const margin = { top: 120, right: 50, bottom: 150, left: 50 }; // Increase bottom margin to make space for the text box
        const width = 800 - margin.left - margin.right;
        const height = 450 - margin.top - margin.bottom; // Reduce the height to avoid text cutoff


        // Define the radius for the pie chart (moved to the correct scope)
        const radius = Math.min(width, height) / 2;

        // Create the SVG for the pie chart
        const svg = d3.select("#scene2")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

        // Title
        svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 - margin.top / 2 - 40) // Adjusted y position to match the distance in Scenes 1 and 3
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .text("Part 2: Percentage of World's Population by Region (2017)");
        // Create the pie chart layout
        const pie = d3.pie()
            .value(d => d.populationPercentage)
            .sort(null);

        // Define the arc shape for the pie segments
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius);

        // Function to calculate the position of the labels outside the pie chart
        const outerArc = d3.arc()
        .innerRadius(radius * 1.1)
        .outerRadius(radius * 1.1);


        // Create the pie chart segments
        const arcs = svg.selectAll(".arc")
            .data(pie(pieData))
            .enter()
            .append("g")
            .attr("class", "arc");

        // Fill the pie segments with colors based on the regions
        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => colorScale(d.data.region))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);

        // Add region labels to the pie chart (outside the pie chart with straight lines)
        arcs.append("line")
        .attr("class", "outer-label-line")
        .attr("x1", d => outerArc.centroid(d)[0])
        .attr("y1", d => outerArc.centroid(d)[1])
        .attr("x2", d => outerArc.centroid(d)[0] * 1.4) // Move the label on the left for left-side quadrants
        .attr("y2", d => outerArc.centroid(d)[1] * 1.4)
        .attr("stroke", "#666")
        .attr("stroke-width", 1);

        arcs.append("text")
        .attr("class", "outer-label")
        .attr("x", d => outerArc.centroid(d)[0] * 1.5) // Move the label on the left for left-side quadrants
        .attr("y", d => outerArc.centroid(d)[1] * 1.5)
        .attr("dy", "0.35em")
        .style("font-size", "12px") // Set the desired font size (you can adjust the value as needed)
        .style("text-anchor", d => (midAngle(d) < Math.PI ? "start" : "end")) // Adjust text-anchor based on quadrant
        .text(d => `${d.data.region} (${Math.round(d.data.populationPercentage)}%)`);
        
        // Function to calculate the middle angle of an arc
        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }
      
        // Remove the legend
        svg.select(".legend").remove();

   // Add the annotation text below the pie chart
        const annotationText = "Despite making up only 5% of the world's population, North America has the highest GDP per capita of any region.";
        const annotationBoxWidth = 300;
        const annotationBoxHeight = 60;

        // Calculate the position of the annotation text box
        const annotationBoxX = -annotationBoxWidth / 2;
        const annotationBoxY = height / 2 + margin.bottom - 60; // Adjust the Y position as needed

        // Append the annotation text box to the SVG
        const annotationBox = svg.append("rect")
            .attr("x", annotationBoxX)
            .attr("y", annotationBoxY)
            .attr("width", annotationBoxWidth)
            .attr("height", annotationBoxHeight)
            .attr("fill", "#f0f0f0") // Light grey background color
            .attr("stroke", "#000") // Set the border color of the text box to black
            .attr("stroke-width", 2); // Set the border width of the text box

        // Create a container for the text
        const textContainer = svg.append("foreignObject")
            .attr("x", annotationBoxX + 10) // Add a small margin from the left edge of the box
            .attr("y", annotationBoxY + 8) // Adjust the Y position to add some padding
            .attr("width", annotationBoxWidth - 20) // Adjust the width to account for margins
            .attr("height", annotationBoxHeight - 15); // Adjust the height to account for margins

        // Append a div inside the container for the text
        const textDiv = textContainer.append("xhtml:div")
            .attr("class", "annotation-text")
            .style("font-size", "12px") // Set the font size of the annotation text
            .style("font-style", "italic") // Set the font style to italic
            .style("line-height", "1.2"); // Set the line height to control the spacing between lines

        // Split the annotation text into lines based on a character count (e.g., 40 characters per line)
        const charPerLine = 40;
        let textLines = [];
        for (let i = 0; i < annotationText.length; i += charPerLine) {
            textLines.push(annotationText.slice(i, i + charPerLine));
        }

        // Add the text lines as separate tspan elements
        textDiv.selectAll("tspan")
            .data(textLines)
            .enter()
            .append("tspan")
            .attr("x", 0) // Start at the beginning of the div (no x offset)
            .attr("dy", "1.2em") // Set the line height for each line
            .text(d => d); // Add the text to each tspan element

        // Find the data for the "North America" region
        const northAmericaData = pieData.find(d => d.region === "North America");

        // Find the centroid of the pie segment for "North America"
        const northAmericaCentroid = outerArc.centroid(northAmericaData);

        // Calculate the starting point (x, y) of the line
        const lineStartX = northAmericaCentroid[0];
        const lineStartY = northAmericaCentroid[1];

        // Calculate the endpoint (x, y) of the line (top of the text box)
        const lineEndX = annotationBoxX + annotationBoxWidth / 2;
        const lineEndY = annotationBoxY;

        // Append the line to the SVG
        svg.append("line")
            .attr("x1", lineEndX-30)
            .attr("y1", lineEndY-140)
            .attr("x2", lineEndX)
            .attr("y2", lineEndY)
            .attr("stroke", "#adadad")
            .attr("stroke-width", 1);

    }
      
    
    function createScene3(data) {
        // Data processing for Scene 3
        let scene3Data = data.filter(d =>
          !isNaN(parseFloat(d["Current health expenditure per capita (current US$)"])) &&
          !isNaN(parseFloat(d["Life expectancy at birth, total (years)"])) &&
          !isNaN(parseFloat(d["Population, total"].replace(/,/g, "")))
        );

        const meanX = d3.mean(scene3Data, d => parseFloat(d["Current health expenditure per capita (current US$)"]));
        const meanY = d3.mean(scene3Data, d => parseFloat(d["Life expectancy at birth, total (years)"]));

      
        // Define color scale for regions
        const colorScale = d3.scaleOrdinal()
            .domain(["North America", "South Asia", "East & Southeast Asia", "West Asia & North Africa", "Sub-Saharan Africa", "Europe", "Latin America & Caribbean", "Oceania", "Central Asia"])
            .range(["#9561e2", "#38c172", "#ffed4a", "#3490dc", "#e3342f", "#6574cd", "#f66d9b", "#f6993f", "#4dc0b5"]);

        // Adjusted margin and spacing for the chart
        const margin = { top: 50, right: 50, bottom: 70, left: 70 };
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
      
        const svg = d3.select("#scene3")
          .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
        // Create the tooltip div
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);
      
       // Define scales
        const xScale = d3.scaleLog()
        .domain(d3.extent(scene3Data, d => parseFloat(d["Current health expenditure per capita (current US$)"])))
        .range([10, width - 10]) // Add padding to the left and right
        .clamp(true); // Clamp the values to ensure they don't go beyond the range

        const yScale = d3.scaleLinear()
            .domain(d3.extent(scene3Data, d => parseFloat(d["Life expectancy at birth, total (years)"])))
            .range([height - 10, 10]); // Add padding to the top and bottom

        const populationScale = d3.scaleSqrt()
          .domain(d3.extent(scene3Data, d => parseFloat(d["Population, total"].replace(/,/g, ""))))
          .range([4, 25]);

        // Function to generate custom tick values for the x-axis
        function customTickValues(scale) {
            const domain = scale.domain();
            const minVal = Math.ceil(domain[0]);
            const maxVal = Math.floor(domain[1]);

            // Generate ticks for the x-axis based on the range [0, 100]
            const customTicks = d3.range(minVal, Math.min(maxVal, 100), 10);
            customTicks.push(Math.min(maxVal, 100)); // Add the maximum value

            // Add more ticks between 1 and 11
            for (let i = 1; i < 10; i++) {
                customTicks.push(i);
            }

            // Add ticks after 100 (e.g., 200, 300, etc.)
            let tickAfter100 = 100;
            while (tickAfter100 < maxVal) {
                tickAfter100 += 100;
                customTicks.push(tickAfter100);
            }

            return customTicks;
        }
        // Add X and Y axes
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).tickValues(customTickValues(xScale)))
            .append("text")
            .attr("x", width / 2)
            .attr("y", 40)
            .attr("fill", "#000")
            .text("Health Expenditure per Capita (current US$)");

        svg.append("g")
            .call(d3.axisLeft(yScale))
            .append("text")
            .attr("x", -height / 2)
            .attr("y", -60)
            .attr("transform", "rotate(-90)")
            .attr("fill", "#000")
            .text("Life Expectancy (years)");

        // Add grey vertical line at the mean of x-values
        svg.append("line")
            .attr("x1", xScale(meanX))
            .attr("y1", height)
            .attr("x2", xScale(meanX))
            .attr("y2", 0)
            .attr("stroke", "#d3d3d3")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4 4");

        // Add grey horizontal line at the mean of y-values
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", yScale(meanY))
            .attr("x2", width)
            .attr("y2", yScale(meanY))
            .attr("stroke", "#d3d3d3")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "4 4");
      
        // Add dots for each country
        svg.selectAll(".dot")
          .data(scene3Data)
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("cx", d => xScale(parseFloat(d["Current health expenditure per capita (current US$)"])))
          .attr("cy", d => yScale(parseFloat(d["Life expectancy at birth, total (years)"])))
          .attr("r", d => populationScale(parseFloat(d["Population, total"].replace(/,/g, ""))))
          .attr("fill", d => colorScale(d["Region"]))
          .on("mouseover", (event, d) => {
            tooltip.transition()
              .duration(200)
              .style("opacity", 0.9);
            tooltip.html(`<strong>${d["Country Name"]}</strong><br>Region: ${d["Region"]}<br>Health Expenditure per Capita (current US$): $${parseFloat(d["Current health expenditure per capita (current US$)"]).toFixed(2)}<br>Life Expectancy: ${parseFloat(d["Life expectancy at birth, total (years)"]).toFixed(2)} years<br>Population: ${d3.format(",")(parseFloat(d["Population, total"].replace(/,/g, "")))}`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", (event, d) => {
            tooltip.transition()
              .duration(500)
              .style("opacity", 0);
          });
      
        // Title
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "24px") // Add a consistent title font size
            .text("Part 3: Health Expenditure per capita (US$) vs. Life Expectancy (2017)");

        // Remove the legend
        svg.select(".legend").remove();

        // Add the annotation text below the chart
        const annotationText = "North American countries have higher life expectancies \nand lower health expenditures on average.";
        const annotationBoxWidth = 180; // Adjusted width to make the box thinner
        const annotationBoxHeight = 70; // Adjusted to show five lines of text
    
        // Calculate the position of the annotation text box
        const annotationBoxX = xScale(2) - 10; // To the right of tick mark 11 on the x-axis with space in between
        const annotationBoxY = yScale(meanY) + 30; // Above the horizontal dashed line with some padding
    
        // Append the annotation text box to the SVG
        const annotationBox = svg.append("rect")
            .attr("x", annotationBoxX)
            .attr("y", annotationBoxY)
            .attr("width", annotationBoxWidth)
            .attr("height", annotationBoxHeight)
            .attr("fill", "#f0f0f0") // Light grey background color
            .attr("stroke", "#000") // Set the border color of the text box to black
            .attr("stroke-width", 1); // Set the border width of the text box
    
        // Create a container for the text
        const textContainer = svg.append("foreignObject")
            .attr("x", annotationBoxX + 10) // Add a small margin from the left edge of the box
            .attr("y", annotationBoxY + 5) // Adjust the Y position to add some padding
            .attr("width", annotationBoxWidth - 20) // Adjust the width to account for margins
            .attr("height", annotationBoxHeight - 5); // Adjust the height to account for margins
    
        // Append a div inside the container for the text
        const textDiv = textContainer.append("xhtml:div")
            .attr("class", "annotation-text")
            .style("font-size", "12px") // Set the font size of the annotation text
            .style("font-style", "italic") // Set the font style to italic
            .style("line-height", "1.2"); // Set the line height to control the spacing between lines
    
        // Split the annotation text into lines based on newline characters ('\n')
        const textLines = annotationText.split('\n');
    
        // Add the text lines as separate tspan elements
        textDiv.selectAll("tspan")
            .data(textLines)
            .enter()
            .append("tspan")
            .attr("x", 0) // Start at the beginning of the div (no x offset)
            .attr("dy", "1.2em") // Set the line height for each line
            .text(d => d); // Add the text to each tspan element
      
          
        // Draw lines from Canada and the United States dots to the text box
    const canadaDotX = xScale(parseFloat(data.find(d => d["Country Name"] === "Canada")["Current health expenditure per capita (current US$)"]));
    const canadaDotY = yScale(parseFloat(data.find(d => d["Country Name"] === "Canada")["Life expectancy at birth, total (years)"]));
    const usDotX = xScale(parseFloat(data.find(d => d["Country Name"] === "United States")["Current health expenditure per capita (current US$)"]));
    const usDotY = yScale(parseFloat(data.find(d => d["Country Name"] === "United States")["Life expectancy at birth, total (years)"]));

    const lineGenerator = d3.line()
      .x(d => d.x)
      .y(d => d.y);

    const lineData = [
      { x: canadaDotX, y: canadaDotY },
      { x: annotationBoxX + annotationBoxWidth / 2, y: annotationBoxY }
    ];

    svg.append("path")
      .attr("class", "line")
      .attr("d", lineGenerator(lineData))
      .attr("stroke", "#adadad")
      .attr("stroke-width", 1)
      .attr("fill", "none");

    const lineData2 = [
      { x: usDotX, y: usDotY },
      { x: annotationBoxX + annotationBoxWidth / 2, y: annotationBoxY }
    ];

    svg.append("path")
      .attr("class", "line")
      .attr("d", lineGenerator(lineData2))
      .attr("stroke", "#adadad")
      .attr("stroke-width", 1)
      .attr("fill", "none");
      
        }
      
      
      // Show Scene 1 by default when the slideshow is initialized
    document.querySelectorAll(".scene").forEach(scene => scene.style.display = "none");
    document.getElementById("scene1").style.display = "block";

    // Call the functions for creating each scene with the provided data
    createScene1(data);
    createScene2(data);
    createScene3(data);
      
      
}    

document.addEventListener("DOMContentLoaded", function () {
    // Call the interactive slideshow function when data is loaded
    d3.csv("CleanedData.csv").then(data => {
      // Create the interactive slideshow
      createInteractiveSlideshow(data);
    });
  
    // Event listeners for the buttons to show respective scenes
    const btnScene1 = document.getElementById("btnScene1");
    const btnScene2 = document.getElementById("btnScene2");
    const btnScene3 = document.getElementById("btnScene3");
  
    btnScene1.addEventListener("click", function () {
      // Show Scene 1 and hide other scenes
      document.querySelectorAll(".scene").forEach(scene => scene.style.display = "none");
      document.getElementById("scene1").style.display = "block";
    });
  
    btnScene2.addEventListener("click", function () {
      // Show Scene 2 and hide other scenes
      document.querySelectorAll(".scene").forEach(scene => scene.style.display = "none");
      document.getElementById("scene2").style.display = "block";
    });
  
    btnScene3.addEventListener("click", function () {
      // Show Scene 3 and hide other scenes
      document.querySelectorAll(".scene").forEach(scene => scene.style.display = "none");
      document.getElementById("scene3").style.display = "block";
    });
  
    // Show Scene 1 by default when the slideshow is initialized
    document.querySelectorAll(".scene").forEach(scene => scene.style.display = "none");
    document.getElementById("scene1").style.display = "block";
  });
  