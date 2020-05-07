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
import chart from './mindmap';
import * as d3 from 'd3'

let node;
const mindmapp = chart();
d3.json('flare-2.json').then(data => {
    mindmapp.build(data, {onClick});
});


function onClick(d, i) {
    if(!d.clicked) {
        node = d;
    } else {
        node = null;
    }
}

document.getElementById("add").addEventListener("click", (e) => {
    if(node) {
        mindmapp.add(node.data.name, {name: 'tutu' + Math.random() * 1000, value: Math.random() * 1000});
        node = null;
    }
});

document.getElementById("remove").addEventListener("click", (e) => {
    if(node) {
        mindmapp.remove(node);
        node = null;
    }
});

document.getElementById("update").addEventListener("click", (e) => {
    if(node) {
        mindmapp.update(node, {name: 'toto' + Math.random() * 1000});
        node = null;
    }
});