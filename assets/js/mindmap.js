import * as d3 from 'd3'

export default function chart() {
    const WIDTH = 760,
        HEIGHT = window.innerHeight - 30,
        SCALE_EXTEND_MIN = 0,
        SCALE_EXTEND_MAX = 8,
        RADIUS = 5, //3.5        
        CHARGE_STRENGTH = -60, // -30
        LINK_DISTANCE = 2, // 2
        LINK_STRENGTH = 1, // 1
        START_ALPHA = 0.3,
        END_ALPHA = 0,
        COLOR_NODE = '#fff', // white
        COLOR_LEAF = '#000', // black
        COLOR_NODE_SELECTED = '#f00', // red
        COLOR_LEAF_SELECTED = '#0f0', // green
        STROKE_NODE = '#000',
        STROKE_LEAF = '#fff',
        STROKE_LINK_NODE = '#f90',
        STROKE_LINK_LEAF = '#0f0',
        STROKE_OPACITY_LINK = 0.6,
        STROKE_WIDTH_NODE = 1.50
        ; 


    let dataJson;
    let root;
    let nodes = [], links = [];
    let onNodeClick;

    let svg = d3.select("#chart-area")
        .append("svg")
        .attr("viewBox", [-WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT]);

    let link = svg
        .append("g")
        // .attr("stroke", STROKE_LINK)
        .attr("stroke-opacity", STROKE_OPACITY_LINK)
        .selectAll("line");

    let node = svg
        .append("g")
        .attr("class", "node")
        .attr("stroke-width", STROKE_WIDTH_NODE) 
        .selectAll("circle");


    let simulation = d3
        .forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(CHARGE_STRENGTH)) 
        .force("x", d3.forceX())
        .force("y", d3.forceY());

    return {
        build,
        add,
        remove,
        update
    };
    
    function build(rootData, {onClick}) {
        onNodeClick = onClick;
        dataJson = rootData;
        root = d3.hierarchy(rootData);
        draw();
    }

    function add(nodeToAddName, newNode) {
        // adding new node to the JSON tree
        let nodeToAdd = getNode(dataJson, nodeToAddName);
        nodeToAdd.children = (nodeToAdd.children || []).concat([newNode]);

        // convert to hierachie and get size of of nodes to add new index
        let length = node.data().length;
        const addingRoot = d3.hierarchy(nodeToAdd);

        // retrieve current value and update with new child
        let cr = getNode(root, nodeToAddName);
        // update last child which is the one just added
        addingRoot.children = addingRoot.children.slice(-1).map(c => ({...c, parent: cr, index: length++, depth: cr.depth + 1}));
        
        // update node with new child and update parent
        cr.children = (cr.children || []).concat(addingRoot.children);
        cr.height = cr.height + addingRoot.children.length;

        draw();
    }

    function remove(nodeToRemove) {
        let parentName = nodeToRemove.parent.data.name;
        // retrieve parent in JSON then remove child
        let parentJson = getNode(dataJson, parentName);
        parentJson.children = parentJson.children.filter(c => c.name !== nodeToRemove.data.name);
        // same in the tree graph
        let parentGraph = getNode(root, parentName);
        parentGraph.children = parentGraph.children.filter(c => c.data.name !== nodeToRemove.data.name);
        parentGraph.data.children = parentGraph.data.children.filter(c => c.name !== nodeToRemove.data.name);
        draw();
    }

    function update(node, updateNode) {
        let nodeJson = getNode(dataJson, node.data.name);
        nodeJson = Object.assign(nodeJson, updateNode);

        let nodeGraph = getNode(root, node.data.name);
        nodeGraph = Object.assign(nodeGraph.data, updateNode);

        draw(true);
    }

    function draw(update) {
        nodes = root.descendants();
        links = root.links();
        
        simulation
            .nodes(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(LINK_DISTANCE).strength(LINK_STRENGTH))
            .on("tick", tick);

        link = link
            .data(links)
            .join("line")
            .attr("stroke", d => d.target.children? STROKE_LINK_NODE : STROKE_LINK_LEAF)
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
        node = node
            .data(nodes, n => n.index)
            .join("circle")
            .attr("fill", d => d.children ? COLOR_NODE : COLOR_LEAF)
            .attr("stroke", d => d.children ? STROKE_NODE : STROKE_LEAF)
            .attr("r", RADIUS)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .call(drag(simulation))
            .on("click", clicked)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);

        if(update) {
            node
            .selectAll("title")
            .text(d => d.data.name);
        } else {
            node
                .append("title")
                .text(d => d.data.name);
        }

        svg.call(
            d3.zoom()
            .extent([[0, 0], [WIDTH, HEIGHT]])
            .scaleExtent([SCALE_EXTEND_MIN, SCALE_EXTEND_MAX])
            .on("zoom", zoomed(link, node))
        );
    }

    function getNode(node, search) {
        return (node.data && node.data.name || node.name) == search ? 
            node :
            !node.children ? 
                null : node.children.reduce((result, child) => getNode(child, search) || result, null);
    }

    function tick() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    function zoomed(link, node) {
        return () => {
            link.attr("transform", d3.event.transform);
            node.attr("transform", d3.event.transform);
        };
    } 

    function clicked(d, i) {
        if (d3.event.defaultPrevented) return; // dragged
        d3.select(this)
            .transition()
            .attr("fill", d => !d.clicked? d.children? COLOR_NODE_SELECTED : COLOR_LEAF_SELECTED : d.children? COLOR_NODE : COLOR_LEAF)
            .attr("r", d => d.clicked? RADIUS : RADIUS * 2);
        
        if(onNodeClick) {
            onNodeClick(d, i);
        }
        d.clicked = !d.clicked;
    }

    function handleMouseOver(d, i) {
        d3.select(this)
            .style("cursor", "pointer")
            .attr("fill", d => d.children? COLOR_NODE_SELECTED : COLOR_LEAF_SELECTED);
    }

    function handleMouseOut(d, i) {
        d3.select(this)
            .style("cursor", "default")
            .attr("fill", d => d.clicked? d.children? COLOR_NODE_SELECTED : COLOR_LEAF_SELECTED : d.children? COLOR_NODE : COLOR_LEAF);
    }

    function drag(simulation) {
    
        function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(START_ALPHA).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        
        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }
        
        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(END_ALPHA);
            d.fx = null;
            d.fy = null;
        }
        
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}