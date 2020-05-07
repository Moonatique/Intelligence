// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../css/app.css"

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative paths, for example:
// import socket from "./socket"

import * as d3 from 'd3'

const width = 760,
    height = window.innerHeight - 30,
    radius = 3.5;

var svg = d3.select("#chart-area")
    .append("svg")
    .attr("viewBox", [-width / 2, -height / 2, width, height]);

function getNode(node, search) {
    return (node.data && node.data.name || node.name) == search ? 
        node :
        !node.children ? 
            null : node.children.reduce((result, child) => getNode(child, search) || result, null);
}
let dataJson;
d3.json('flare-2.json').then(data => {
    dataJson = data;
    chart(dataJson, true);
});

let link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll("line");

let node = svg
    .append("g")
    .attr("class", "node")
    .attr("fill", "#fff")
    .attr("stroke", "#000")
    .attr("stroke-width", 1.50) // 1.5
    .selectAll("circle");

let nodes = [], links = [];

let simulation = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-30)) // -50
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .alphaTarget(0.3);

let root;
function chart(rootData) {
    if (!root) {
        root = d3.hierarchy(rootData);
    } else {
        let length = node.data().length;
        const addingRoot = d3.hierarchy(rootData);
        let cr = getNode(root, rootData.name);

        addingRoot.children = addingRoot.children.slice(-1).map(c => ({...c, parent: cr, index: length++, depth: cr.depth + 1}));
        cr.children = (cr.children || []).concat(addingRoot.children);
        cr.height = addingRoot.height + cr.children;
    }
    
    nodes = root.descendants();
    links = root.links();
    
    simulation
        .nodes(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(2).strength(1))// 1
        // .alpha(1)
        .on("tick", tick)
    
    link = link
        .data(links)
        .join("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    
    node = node
        .data(nodes, n => n.index)
        .join("circle")
        .attr("fill", d => ["tutu", "IRenderer"].filter(s => d.data.name.indexOf(s) == 0).length ? "#900" :  d.children ? null : "#000")
        .attr("stroke", d => d.children ? null : "#fff")
        .attr("r", radius)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .call(drag(simulation))
        .on("click", clicked);

    node.append("title")
      .text(d => d.data.name);
    
    svg.call(
        d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 8])
        .on("zoom", zoomed(link, node))
    );

}

const tick = () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
}

const zoomed = (link, node) => () => {
    link.attr("transform", d3.event.transform);
    node.attr("transform", d3.event.transform);
} 

function clicked(d, i) {
    if (d3.event.defaultPrevented) return; // dragged
    d3.select(this)
        .transition()
        .attr("fill", d => !d.clicked? "blue" : d.children? null : "#000")
        .attr("r", d.clicked? radius : radius * 2);
        
    if (d.clicked) {
        let nodeToAdd = getNode(dataJson, d.data.name);
        nodeToAdd.children = (nodeToAdd.children || []).concat([{name: 'tutu' + Math.random() * 1000, value: Math.random() * 1000}]);
        chart(nodeToAdd);
    }
    d.clicked = !d.clicked;
}

function drag(simulation) {
  
    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    
    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}
