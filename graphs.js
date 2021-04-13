const dataPath = "data/Tricorache_et_al_Global_trade_dataset_for_cheetah.csv"; // our data file	

const showCountry = function () {
    document.getElementById("bar").style.display = "none";
    document.getElementById("circular").style.display = "block"
    document.getElementById("button").innerText = "Show reports by region"
    document.getElementById("button").onclick = showRegion;
}

const showRegion = function () {
    document.getElementById("bar").style.display = "block";
    document.getElementById("circular").style.display = "none"
    document.getElementById("button").innerText = "Show reports by country"
    document.getElementById("button").onclick = showCountry;
}

// parse the date / time
const parseTime = d3.timeParse("%d-%b-%y");

// Create the tooltip
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Get the data
d3.csv(dataPath).then(function (data) {
    // format the data
    data.forEach(function (d) {
        d.Incident_Date = parseTime(d.Incident_Date); //Change to Date
        d.Cheetahs_Number = +d.Cheetahs_Number; //change to int
        d.Cheetahs_Number = isNaN(d.Cheetahs_Number) ? null : d.Cheetahs_Number; // Change to null if it's not an integer
        d.Alive = +d.Alive;
        d.Alive = isNaN(d.Alive) ? null : d.Alive;
        d.Died = +d.Died;
        d.Died = isNaN(d.Died) ? null : d.Died;
    });

    /*Bar Chart - Start- https://github.com/kriscfoster/d3-barchart*/

    // Group and count instances by region 
    const data_bar = d3.nest()
        .key(function (d) { return d.Region; })
        .rollup(function (v) { return v.length; })
        .entries(data);

    const margin_bar = { top: 10, right: 30, bottom: 90, left: 70 },
        width_bar = 700 - margin_bar.left - margin_bar.right,
        height_bar = 580 - margin_bar.top - margin_bar.bottom;

    // append the svg object to the body of the page
    const bar_svg = d3.select('#bar')
        .append("svg")
        .attr("width", width_bar + margin_bar.left + margin_bar.right)
        .attr("height", height_bar + margin_bar.top + margin_bar.bottom)
        .append("g")
        .attr("transform", "translate(" + margin_bar.left + "," + margin_bar.top + ")");

    // Add X axis
    const bar_x = d3.scaleBand()
        .range([0, width_bar])
        .domain(data_bar.sort((a, b) => d3.descending(a.value, b.value))
            .map(d => d.key))
        .padding(0.1);

    bar_svg.append("g")
        .attr("transform", "translate(0," + height_bar + ")")
        .call(d3.axisBottom(bar_x))
        .selectAll("text")
        .style("class", "x-axis")

    // Add Y axis
    const bar_y = d3.scaleLinear()
        .domain([0, d3.max(data_bar, function (d) { return d.value; })])
        .range([height_bar, 0]);

    bar_svg.append("g")
        .call(d3.axisLeft(bar_y));

    //Draw bar
    bar_svg.selectAll("bars")
        .data(data_bar)
        .enter()
        .append("rect")
        .attr("x", function (d) { return bar_x(d.key); })
        .attr("y", function (d) { return bar_y(d.value); })
        .attr("width", bar_x.bandwidth())
        .attr("height", function (d) { return height_bar - bar_y(d.value); })
        .attr("fill", "green")
        .attr("class", "rect")
        .on('mouseover', d => {
            tooltip.style('opacity', 0.9)
                .html(d.value + " reports")
                .style("height", "20px")
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY - 20 + 'px');
        })
        .on('mouseout', () => { tooltip.style('opacity', 0) })

    // Add axis labels
    bar_svg.append("text")
        .attr("class", "axis-label")
        .attr("x", (width_bar) / 2)
        .attr("y", height_bar + margin_bar.bottom - 40)
        .style("text-anchor", "middle")
        .text("Region (Continent)");

    bar_svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin_bar.left)
        .attr("x", 0 - (height_bar / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of reports");


    /* Bar Chart - End*/

    /* Circular Chart - https://www.d3-graph-gallery.com/graph/circular_barplot_label.html */

    const c_margin = { top: 130, right: 0, bottom: 0, left: 0 },
        c_width = 660 - c_margin.left - c_margin.right,
        c_height = 600 - c_margin.top - c_margin.bottom,
        innerRadius = 90,
        outerRadius = Math.min(c_width, c_height) / 2;

    const nestedCountry = d3.nest()
        .key(function (d) { return d.Country })
        .rollup(function (v) { return v.length; })
        .entries(data);
    console.log(nestedCountry);
    nestedCountry.sort((a, b) => d3.descending(a.value, b.value));

    // append the svg object
    const c_svg = d3.select("#circular")
        .append("svg")
        .attr("width", c_width + c_margin.left + c_margin.right)
        .attr("height", c_height + c_margin.top + c_margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (c_width / 2 + c_margin.left) + "," + (c_height / 2 + c_margin.top) + ")");

    // Scales
    const c_x = d3.scaleBand()
        .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0) // This does nothing
        .domain(nestedCountry.map(function (d) { return d.key; })); // The domain of the X axis is the list of states.
    const c_y = d3.scaleRadial()
        .range([innerRadius, outerRadius]) // Domain will be define later.
        .domain([0, d3.max(nestedCountry, function (d) { return d.value; })]); // Domain of Y is from 0 to the max seen in the data

    // Add the bars
    c_svg.append("g")
        .selectAll("path")
        .data(nestedCountry)
        .enter()
        .append("path")
        .attr("fill", "green")
        .attr("d", d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(function (d) { return c_y(d.value); })
            .startAngle(function (d) { return c_x(d.key); })
            .endAngle(function (d) { return c_x(d.key) + c_x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))

    // Add the labels
    c_svg.append("g")
        .selectAll("g")
        .data(nestedCountry)
        .enter()
        .append("g")
        .attr("text-anchor", function (d) { return (c_x(d.key) + c_x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
        .attr("transform", function (d) { return "rotate(" + ((c_x(d.key) + c_x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (c_y(d.value) + 10) + ",0)"; })
        .append("text")
        .text(function (d) { return (`${d.key} - ${d.value}`) })
        .attr("transform", function (d) { return (c_x(d.key) + c_x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle")


    /* Circular Chart - End */

    /* Lollipop Chart - Start https://www.d3-graph-gallery.com/graph/lollipop_basic.html */
    const margin_lol = { top: 10, right: 30, bottom: 90, left: 60 },
        width_lol = 700 - margin_lol.left - margin_lol.right,
        height_lol = 580 - margin_lol.top - margin_lol.bottom;

    /*Code to group all media apart from the top 5 in "Others"
      const Medium = ["Social Media", "eCommerce", "Email", "Phone App", "Web site", "Others"];
      const others = [];
        //Use the following block in the .key function
        if (Medium.includes(d.Medium)) { return d.Medium; }
        else {
            if (!others.includes(d.Medium)) others.push(d.Medium);
            return "Others";
        }*/

    const nestedMedium = d3.nest()
        .key(function (d) { return d.Medium })
        .rollup(function (v) { return v.length; })
        .entries(data);
    console.log(nestedMedium);

    // append the svg object to the body of the page
    const lol_svg = d3.select("#lollipop")
        .append("svg")
        .attr("width", width_lol + margin_lol.left + margin_lol.right)
        .attr("height", height_lol + margin_lol.top + margin_lol.bottom)
        .append("g")
        .attr("transform", "translate(" + margin_lol.left + "," + margin_lol.top + ")");

    // X axis
    const lol_x = d3.scaleBand()
        .range([0, width_lol])
        .domain(nestedMedium.sort((a, b) => d3.descending(a.value, b.value))
            .map(d => d.key))
        .padding(1);

    lol_svg.append("g")
        .attr("transform", "translate(0," + height_lol + ")")
        .call(d3.axisBottom(lol_x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("class", "x-axis")
        .style("text-anchor", "end");

    // Add Y axis
    const lol_y = d3.scaleLinear()
        .domain([0, d3.max(nestedMedium, function (d) { return d.value; })])
        .range([height_lol, 0]);

    lol_svg.append("g")
        .call(d3.axisLeft(lol_y));

    // Draw Lines
    lol_svg.selectAll("lines")
        .data(nestedMedium)
        .enter()
        .append("line")
        .attr("x1", function (d) { return lol_x(d.key); })
        .attr("x2", function (d) { return lol_x(d.key); })
        .attr("y1", function (d) { return lol_y(d.value); })
        .attr("y2", lol_y(0))
        .attr("stroke", "purple");

    // Draw Circles
    lol_svg.selectAll("circle")
        .data(nestedMedium)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return lol_x(d.key); })
        .attr("cy", function (d) { return lol_y(d.value); })
        .attr("r", "4")
        .style("fill", "#69b3a2")
        .attr("stroke", "black")
        .on('mouseover', d => {
            tooltip.style('opacity', 0.9)
                .html(d.value + " reports")
                .style("height", "20px")
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY - 20 + 'px');
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0);
        });

    // Add axis labels
    lol_svg.append("text")
        .attr("class", "axis-label")
        .attr("x", (width_lol) / 2)
        .attr("y", height_lol + margin_lol.bottom - 5)
        .style("text-anchor", "middle")
        .text("Reported Medium");

    lol_svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin_lol.left)
        .attr("x", 0 - (height_lol / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Reports");

    /* Lollipop Chart - End */


    /* Line Graph - https://www.d3-graph-gallery.com/graph/line_brushZoom.html */

    const margin_line = { top: 20, right: 20, bottom: 90, left: 60 },
        width_line = 1400 - margin_line.left - margin_line.right,
        height_line = 500 - margin_line.top - margin_line.bottom;

    // append the svg obgect to the div and position it
    const line_svg = d3.select("#line")
        .append("svg")
        .attr("id", "line-svg")
        .attr("width", width_line + margin_line.left + margin_line.right)
        .attr("height", height_line + margin_line.top + margin_line.bottom)
        .append("g")
        .attr("transform", "translate(" + margin_line.left + "," + margin_line.top + ")");

    // Group by month for Total/Dead/Alive attributes
    const Cheetahs_NumberTotal = d3.nest()
        .key(d => { return d3.timeMonth(d.Incident_Date); })
        .rollup(value => { return d3.sum(value, d => { return d.Cheetahs_Number; }); })
        .entries(data);
    console.log(Cheetahs_NumberTotal);

    const DiedTotal = d3.nest()
        .key(d => { return d3.timeMonth(d.Incident_Date); })
        .rollup(value => { return d3.sum(value, d => { return d.Died; }); })
        .entries(data);
    console.log(DiedTotal);

    const AliveTotal = d3.nest()
        .key(d => { return d3.timeMonth(d.Incident_Date); })
        .rollup(value => { return d3.sum(value, d => { return d.Alive; }); })
        .entries(data);
    console.log(AliveTotal);

    // Set the ranges for the data
    const x = d3.scaleTime()
        .range([0, width_line])
        .domain(d3.extent(Cheetahs_NumberTotal, function (d) { return new Date(d.key); }));

    const y = d3.scaleLinear()
        .range([height_line, 0])
        .domain([0, d3.max(Cheetahs_NumberTotal, d => { return d.value; })]);

    // Draw the X Axis
    const xScale = line_svg.append("g")

        .attr("transform", "translate(0," + height_line + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d-%b-%Y")))

    xScale.selectAll("text")
        .style("class", "x-axis")
        .attr("dx", "-0.5em")
        .attr("dy", "0.15em")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)");

    // Draw the Y Axis
    line_svg.append("g")
        .call(d3.axisLeft(y));

    // Create clip area in which lines will be drawn
    var clip = line_svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width_line)
        .attr("height", height_line + 0.5)
        .attr("x", 0)
        .attr("y", 0);

    // Create the brushing area
    var brush = d3.brushX()
        .extent([
            [0, 0],
            [width_line, height_line]
        ]) // Entire area is selectable
        .on("end", updateChart) // Once selected, update all data points

    // Create the variables where the brushing and clipping takes place on the line/area/circles
    var totalLine = line_svg.append('g')
        .attr("clip-path", "url(#clip)")

    var area = line_svg.append('g')
        .attr("clip-path", "url(#clip)")

    var circles = line_svg.append('g')
        .attr("clip-path", "url(#clip)")

    // Add the brushing - brushing only needs to be appended to one object. The others will still update in the function
    // Brushing must be added before the data points to allow hovering effects
    totalLine.append("g")
        .attr("class", "brush")
        .call(brush);

    // Draw the areas and circles for dead cheetahs    
    area.append("path")
        .datum(DiedTotal)
        .attr("class", "area")
        .style("stroke", "red")
        .style("fill", "red")
        .attr("d", d3.area()
            .x(d => { return x(new Date(d.key)); })
            .y1(d => { return y(d.value); })
            .y0(d => { return y.range()[0]; }))

    circles.selectAll("dots")
        .data(DiedTotal)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("fill", "red")
        .attr("stroke", "none")
        .attr("cx", function (d) { return x(new Date(d.key)) })
        .attr("cy", function (d) { return y(d.value) })
        .attr("r", 3)
        .on('mouseover', d => showTip(d))
        .on('mouseout', () => { tooltip.style('opacity', 0); });

    // Draw the areas and circles for alive cheetahs 
    area.append("path")
        .data([AliveTotal])
        .attr("class", "area")
        .style("stroke", "blue")
        .style("fill", "blue")
        .attr("d", d3.area()
            .x(d => { return x(new Date(d.key)); })
            .y1(d => { return y(d.value); })
            .y0(d => { return y.range()[0]; }))

    circles.selectAll("dot")
        .data(AliveTotal)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("fill", "blue")
        .attr("stroke", "none")
        .attr("cx", function (d) { return x(new Date(d.key)) })
        .attr("cy", function (d) { return y(d.value) })
        .attr("r", 3)
        .on('mouseover', d => showTip(d))
        .on('mouseout', () => { tooltip.style('opacity', 0); });

    // Draw the line
    totalLine.append("path")
        .datum(Cheetahs_NumberTotal)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            //.defined(d => { return d.Cheetahs_Number != null; })  // Ignores null values instead of showing 0 (is not needed for nested data)
            .x(function (d) { return x(new Date(d.key)) })
            .y(function (d) { return y(d.value) })
        )

    // Draw the circles
    circles.selectAll("circles")
        .data(Cheetahs_NumberTotal)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("fill", "black")
        .attr("stroke", "none")
        .attr("cx", function (d) { return x(new Date(d.key)) })
        .attr("cy", function (d) { return y(d.value) })
        .attr("r", 3)
        .on('mouseover', d => showTip(d))
        .on('mouseout', () => { tooltip.style('opacity', 0); });

    // A function that sets idleTimeOut to null
    var idleTimeout;

    function idled() { idleTimeout = null; }

    // A function that updates the chart for given boundaries
    function updateChart() {

        // What are the selected boundaries?
        extent = d3.event.selection

        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain([4, 8])
        } else {
            x.domain([x.invert(extent[0]), x.invert(extent[1])])
            totalLine.select(".brush").call(brush.move, null) // This removes the grey brush area as soon as the selection has been done
        }

        // Update axis and line/area/circles position
        xScale.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d-%b-%Y")))
            .selectAll("text")
            .attr("dx", "-0.5em")
            .attr("dy", "0.15em")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)");

        area.selectAll(".area")
            .attr("d", d3.area()
                .x(d => { return x(new Date(d.key)); })
                .y1(d => { return y(d.value); })
                .y0(d => { return y.range()[0]; }))

        totalLine.select('.line')
            .attr("d", d3.line()
                .x(function (d) { return x(new Date(d.key)) })
                .y(function (d) { return y(d.value) })
            )

        circles.selectAll(".circle")
            .attr("cx", function (d) { return x(new Date(d.key)) })
            .attr("cy", function (d) { return y(d.value) })
            .attr("r", 3)
            .on('mouseover', d => showTip(d))
            .on('mouseout', () => { tooltip.style('opacity', 0); });
    }

    // Reset chart when double clicking
    line_svg.on("dblclick", function () {
        x.domain(d3.extent(Cheetahs_NumberTotal, function (d) { return new Date(d.key); }));
        xScale.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d-%b-%Y")))
            .selectAll("text")
            .attr("dx", "-0.5em")
            .attr("dy", "0.15em")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)");

        area.selectAll(".area")
            .attr("d", d3.area()
                .x(d => { return x(new Date(d.key)); })
                .y1(d => { return y(d.value); })
                .y0(d => { return y.range()[0]; }))

        line_svg.select('.line')
            .attr("d", d3.line()
                .x(function (d) { return x(new Date(d.key)) })
                .y(function (d) { return y(d.value) })
            )

        circles.selectAll(".circle")
            .attr("cx", function (d) { return x(new Date(d.key)) })
            .attr("cy", function (d) { return y(d.value) })
            .attr("r", 3)
            .on('mouseover', d => showTip(d))
            .on('mouseout', () => { tooltip.style('opacity', 0); });
    });

    // Function to show tooltip for line/area graph
    function showTip(d) {
        const dateFormat = d3.timeFormat("%b-%Y");

        tooltip.style('opacity', 0.9)
            .html(dateFormat(new Date(d.key)) + '<br/> #Cheetahs: ' + d.value)
            .style("height", "35px")
            .style('left', d3.event.pageX + 'px')
            .style('top', d3.event.pageY + 5 + 'px');
    }

    // Add axis labels
    line_svg.append("text")
        .attr("class", "axis-label")
        .attr("x", (width_line) / 2)
        .attr("y", height_line + margin_line.bottom)
        .style("text-anchor", "middle")
        .text("Incident Date");

    line_svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin_line.left)
        .attr("x", 0 - (height_line / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Cheetahs");

    // Add legends						
    line_svg.append("text")
        .attr("x", width_line - margin_line.left - 90)
        .attr("y", margin_line.top + 10)
        .attr("class", "legend")
        .style("fill", "black")
        .text("Total Cheetahs Found");

    line_svg.append("text")
        .attr("x", width_line - margin_line.left - 35)
        .attr("y", margin_line.top + 30)
        .attr("class", "legend")
        .style("fill", "blue")
        .text("Reported Alive");

    line_svg.append("text")
        .attr("x", width_line - margin_line.left - 35)
        .attr("y", margin_line.top + 50)
        .attr("class", "legend")
        .style("fill", "red")
        .text("Reported Dead");

    /* Line Chart - End */
});

/* Handling Modals  https://www.w3schools.com/howto/howto_css_modals.asp */

// Get the modal
var modal = document.getElementById("info_modal");

// When the user clicks on the information icon, open the modal
const openModal = function (element) {
    applyModalText(element.id);
    modal.style.display = "block";
}

//Apply modal text accordingly to the correspoding information icon
const applyModalText = function (modal) {
    let header, body, footer = "";
    if (modal == "info_location") {
        header = "Additional information about reports linked to location";
        body = `
        <p>Addressing the bar chart:</p>
        <ul>
            <li>Countries in the Middle East had the majority of reports of illegal cheetah trading.</li>
        </ul>
        <p>Addressing the circular chart:</p>
        <ul>
            <li>Countries in the Middle East had the majority of reports of illegal cheetah trading.</li>
            <li>The country "UAE" means United Arab Emirates.</li>
            <li>United Kingdom (UK) comprises four countries: England, Scotland, Northern Ireland and Wales.
            </li>
        </ul>
        `;
    } else if (modal == "info_media") {
        header = "Additional information about reports linked to media";
        body = `
        <p>The sources of reports were heavily concentrated with most trades found through the internet.</p>
        <p>Subsequently, the table contains information about the different media types:</p>
        <table>
            <tr>
                <th>Medium</th>
                <th>Explanation</th>
            </tr>
            <tr>
                <td>Social Media</td>
                <td>Social media such as Facebook, Instagram or Snapchat.</td>
            </tr>
            <tr>
                <td>eCommerce</td>
                <td>Online webshops offering cheetahs.</td>
            </tr>
            <tr>
                <td>Email</td>
                <td>Reports that are communicated via Emails.</td>
            </tr>
            <tr>
                <td>Phone App</td>
                <td>Reports that are published on applications not related to social media.</td>
            </tr>
            <tr>
                <td>Website</td>
                <td>Reports that are published on public accessible websites.</td>
            </tr>
            <tr>
                <td>Website</td>
                <td>Incidents that are announced in public reports.</td>
            </tr>
            <tr>
                <td>Media</td>
                <td>Reports that are transmitted on television or newspapers.</td>
            </tr>
            <tr>
                <td>Database</td>
                <td>Reports that were already identified by existing databases.</td>
            </tr>
            <tr>
                <td>NGO</td>
                <td>Reports that are discovered by Non-Governmental-Organisations (NGO).</td>
            </tr>
            <tr>
                <td>Direct</td>
                <td>Incidents were the publisher of the data set of directly contacted by sellers of cheetahs.</td>
            </tr>
            <tr>
                <td>Newsletter</td>
                <td>Reports from offcials or governmental organisations.</td>
            </tr>
            <tr>
                <td>Thesis</td>
                <td>Reports published in academic thesis.</td>
            </tr>
            <tr>
                <td>Field report</td>
                <td>Reports published as outcome of field studies.</td>
            </tr>
            <tr>
                <td>Blog</td>
                <td>Reports published in blogs by volunteers.</td>
            </tr>
            <tr>
                <td>Invoice</td>
                <td>Reports linked to bills for bought cheetahs.</td>
            </tr>
            <tr>
                <td>Courts records</td>
                <td>Reports related to justice.</td>
            </tr>
        </table>`;
    } else if (modal == "info_quantity") {
        header = "Additional information about reports linked to found cheetahs";
        body = `
        <ul>
            <li>The timeline shows an overview of the number of cheetahs reported over ten years.</li>
            <li>Zooming into these spikes, one can see that these always happen in the last quarter of the year, before December, possibly indicating a surge in buying cheetahs or cheetah products for the winter holidays.</li>
            <li>Furthermore, positive upswings in found cheetahs is often linked to an upswing in cheetahs reported dead, suggesting cases with many dead cheetah body parts reported .</li>
        </ul>
        `;
    }
    document.getElementById("modal_header").innerHTML = header;
    document.getElementById("modal_body").innerHTML = body;
}

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}