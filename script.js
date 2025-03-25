const width = 960;
const height = 600;

const svg = d3.select("#map")
    .attr("width", width)
    .attr("height", height);

const tooltip = d3.select("#tooltip");
const path = d3.geoPath();
const colorScale = d3.scaleQuantize()
    .domain([0, 60])
    .range(d3.schemeBlues[9]);

Promise.all([
    d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
    d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
]).then(([us, education]) => {
    const educationMap = new Map(education.map(d => [d.fips, d]));

    svg.append("g")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("class", "county")
        .attr("data-fips", d => d.id)
        .attr("data-education", d => educationMap.get(d.id)?.bachelorsOrHigher || 0)
        .attr("fill", d => colorScale(educationMap.get(d.id)?.bachelorsOrHigher || 0))
        .attr("d", path)
        .on("mouseover", (event, d) => {
            const eduData = educationMap.get(d.id);
            tooltip.style("display", "block")
                .style("left", event.pageX + "px")
                .style("top", event.pageY - 30 + "px")
                .html(`${eduData.area_name}, ${eduData.state}: ${eduData.bachelorsOrHigher}%`)
                .attr("data-education", eduData.bachelorsOrHigher);
        })
        .on("mouseout", () => tooltip.style("display", "none"));

    const legend = d3.select("#legend");
    legend.selectAll("div")
        .data(colorScale.range())
        .enter().append("div")
        .attr("class", "legend-box")
        .style("background-color", d => d)
        .text((d, i) => `${Math.round(colorScale.invertExtent(d)[0])}%`);
});