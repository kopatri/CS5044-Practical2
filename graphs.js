const dataPath = "data/Tricorache_et_al_Global_trade_dataset_for_cheetah.csv"; // our data file	

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

    const margin_bar = { top: 10, right: 40, bottom: 60, left: 40 };
    const width_bar = 850;
    const height_bar = 400;

    const bar_svg = d3.select('#bar')
        .append('svg')
        .attr('width', width_bar - margin_bar.left - margin_bar.right)
        .attr('height', height_bar - margin_bar.top - margin_bar.bottom)
        .attr("viewBox", [0, 0, width_bar, height_bar]);

    const bar_x = d3.scaleBand()
        .domain(d3.range(data_bar.length))
        .range([margin_bar.left, width_bar - margin_bar.right])
        .padding(0.1)

    const bar_y = d3.scaleLinear()
        .domain([0, d3.max(data_bar, function (d) { return d.value; })])
        .range([height_bar - margin_bar.bottom, margin_bar.top])

    bar_svg.append("g")
        .attr("fill", 'green')
        .selectAll("rect")
        .data(data_bar.sort((a, b) => d3.descending(a.value, b.value)))
        .join("rect")
        .on('mouseover', d => {
            tooltip.style('opacity', 0.9)
                .html(d.value + " incidents")
                .style("height", "15px")
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY - 10 + 'px');
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0)
        })
        .attr("x", (d, i) => bar_x(i))
        .attr("y", d => bar_y(d.value))
        .attr('title', (d) => d.value)
        .attr("class", "rect")
        .attr("height", d => bar_y(0) - bar_y(d.value))
        .attr("width", bar_x.bandwidth());

    //Add label for x axis
    bar_svg.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", (width_bar) / 2)
        .attr("y", (height_bar + margin_bar.top - 20))
        .text("Region (Continent)");

    //Add label for y axis
    bar_svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin_bar.left)
        .attr("x", 0 - (height_bar / 2))
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Incidents")

    //Add title for visualization
    bar_svg.append("h1")
        .attr("x", (width_bar) / 2)
        .attr("y", (height_bar + margin_bar.top + 20))
        .attr("text-anchor", "middle")
        .text("Title");

    function yAxis(g) {
        g.attr("transform", `translate(${margin_bar.left}, 0)`)
            .call(d3.axisLeft(bar_y).ticks(null, data_bar.format))
            .attr("font-size", '20px')
    }

    function xAxis(g) {
        g.attr("transform", `translate(0,${height_bar - margin_bar.bottom})`)
            .call(d3.axisBottom(bar_x).tickFormat(i => data_bar[i].key))
            .attr("font-size", '20px')
    }

    bar_svg.append("g").call(xAxis);
    bar_svg.append("g").call(yAxis);

    bar_svg.node();
    /* Bar Chart - End*/

    /* Lollipop Chart - Start https://www.d3-graph-gallery.com/graph/lollipop_basic.html */
    const margin_lol = { top: 10, right: 30, bottom: 90, left: 60 },
        width_lol = 650 - margin_lol.left - margin_lol.right,
        height_lol = 500 - margin_lol.top - margin_lol.bottom;

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
                .html(d.value + " incidents")
                .style("height", "15px")
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
        .attr("y", height_lol + margin_lol.bottom - 10)
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


    /* Line Graph - https://bl.ocks.org/d3noob/daecba427fed7c2d912d8abbe9f3e784 */

    const margin_line = { top: 20, right: 20, bottom: 30, left: 50 },
        width_line = 960 - margin_line.left - margin_line.right,
        height_line = 500 - margin_line.top - margin_line.bottom;

    // append the svg obgect to the div and position it
    const line_svg = d3.select("#line")
        .append("svg")
        .attr("id", "line-svg")
        .attr("width", width_line + margin_line.left + margin_line.right)
        .attr("height", height_line + margin_line.top + margin_line.bottom)
        .append("g")
        .attr("transform", "translate(" + margin_line.left + "," + margin_line.top + ")");

    // Group by month
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
        .domain(d3.extent(data, d => { return d.Incident_Date; }));

    const y = d3.scaleLinear()
        .range([height_line, 0])
        .domain([0, d3.max(Cheetahs_NumberTotal, d => { return d.value; })]);

    // Create the line
    const totalLine = d3.line()
        //.defined(function(d) { return d.Cheetahs_Number != null; })  // Ignores null values instead of showing them as 0
        .x(function (d) { return x(new Date(d.key)); })
        .y(function (d) { return y(d.value); });

    // Create the area
    const area = d3.area()
        .x(d => { return x(new Date(d.key)); })
        .y1(d => { return y(d.value); })
        .y0(d => { return y.range()[0]; })

    // Draw the line for total number of Cheetahs found
    line_svg.append("path")
        .data([Cheetahs_NumberTotal])
        .attr("class", "line")
        .style("stroke", "black")
        .attr("d", totalLine);

    // Add circles on each data point on the line
    line_svg.selectAll("circle")
        .data(Cheetahs_NumberTotal)
        .enter()
        .append("circle")
        .attr("fill", "black")
        .attr("stroke", "none")
        .attr("cx", function (d) { return x(new Date(d.key)) })
        .attr("cy", function (d) { return y(d.value) })
        .attr("r", 3)
        .on('mouseover', d => {
            const dateFormat = d3.timeFormat("%b-%Y");

            tooltip.style('opacity', 0.9)
                .html(dateFormat(new Date(d.key)) + '<br/> #Cheetahs: ' + d.value)
                .style("height", "30px")
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY + 5 + 'px');
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0);
        });

    // Draw the areas for total number found dead and alive
    line_svg.append("path")
        .data([DiedTotal])
        .attr("class", "area")
        .style("stroke", "red")
        .style("fill", "red")
        .attr("d", area);

    line_svg.append("path")
        .data([AliveTotal])
        .attr("class", "area")
        .style("stroke", "blue")
        .style("fill", "blue")
        .attr("d", area);

    // Draw the X Axis
    line_svg.append("g")
        .attr("transform", "translate(0," + height_line + ")")
        .call(d3.axisBottom(x));

    // Draw the Y Axis
    line_svg.append("g")
        .call(d3.axisLeft(y));

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
        .attr("x", width_line - margin_line.left - 120)
        .attr("y", margin_line.top + 10)
        .attr("class", "legend")
        .style("fill", "black")
        .text("Number of Cheetahs Found");

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
        .text("Reported Died");

    /* Line Chart - End */

    /* Radial Chart */
    // set the dimensions and margins of the graph
    const rad_margin = { top: 100, right: 0, bottom: 0, left: 0 },
        rad_width = 660 - rad_margin.left - rad_margin.right,
        rad_height = 660 - rad_margin.top - rad_margin.bottom,
        innerRadius = 90,
        outerRadius = Math.min(rad_width, rad_height) / 2;

    const nestedCountry = d3.nest()
        .key(function (d) { return d.Country })
        .rollup(function (v) { return v.length; })
        .entries(data);
    console.log(nestedCountry);
    nestedCountry.sort((a, b) => d3.descending(a.value, b.value));

    // append the svg object
    const rad_svg = d3.select("#radial")
        .append("svg")
        .attr("width", rad_width + rad_margin.left + rad_margin.right)
        .attr("height", rad_height + rad_margin.top + rad_margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (rad_width / 2 + rad_margin.left) + "," + (rad_height / 2 + rad_margin.top) + ")");

    // Scales
    const rad_x = d3.scaleBand()
        .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0)                  // This does nothing
        .domain(nestedCountry.map(function (d) { return d.key; })); // The domain of the X axis is the list of states.
    const rad_y = d3.scaleRadial()
        .range([innerRadius, outerRadius])   // Domain will be define later.
        .domain([0, d3.max(nestedCountry, function (d) { return d.value; })]); // Domain of Y is from 0 to the max seen in the data

    // Add the bars
    rad_svg.append("g")
        .selectAll("path")
        .data(nestedCountry)
        .enter()
        .append("path")
        .attr("fill", "#69b3a2")
        .attr("d", d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(function (d) { return rad_y(d.value); })
            .startAngle(function (d) { return rad_x(d.key); })
            .endAngle(function (d) { return rad_x(d.key) + rad_x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))

    // Add the labels
    rad_svg.append("g")
        .selectAll("g")
        .data(nestedCountry)
        .enter()
        .append("g")
        .attr("text-anchor", function (d) { return (rad_x(d.key) + rad_x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
        .attr("transform", function (d) { return "rotate(" + ((rad_x(d.key) + rad_x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (rad_y(d.value) + 10) + ",0)"; })
        .append("text")
        .text(function (d) { return (d.key) })
        .attr("transform", function (d) { return (rad_x(d.key) + rad_x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
        .style("font-size", "11px")
        .attr("alignment-baseline", "middle")


    /* Radial Chart - End */
});