// https://github.com/grafana/grafana/blob/develop/public/dashboards/scripted.js
// servers_raw = $.getJSON('https://ip/api/datasources/proxy/1/metrics/find/?query=telegraf.*')
// $.getJSON('https://ip/api/datasources/proxy/1/metrics/find/?query=telegraf.*', function(result)) {
//
// }

'use strict';

// accessible variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;

// All url parameters are available via the ARGS object
var ARGS;

// Setup some variables
var dashboard, row, panels, panel, cols, graph, templates, iface, dsname, s;
templates = {};

cols = 3;
if(!_.isUndefined(ARGS.cols)) {
  cols = parseInt(ARGS.cols, 10);
  if (cols > 12) { cols = 12 }
  if (cols < 1)  { cols = 1 }
}

var span = Math.floor(12/cols);

graph = "RAM";
if(!_.isUndefined(ARGS.graph)) {
  graph = ARGS.graph;
}

dsname = null;
if(!_.isUndefined(ARGS.dsname)) {
  dsname = ARGS.dsname;
}

iface = "agge";
if(!_.isUndefined(ARGS.iface)) {
  iface = ARGS.iface;
}

s = '*';
if(!_.isUndefined(ARGS.s)) {
  s = ARGS.s;
}

console.log("Panels in a row: " + Math.floor(12/span) + ", span: " + span);
console.log(Math.floor(12/span));
//
dashboard = {
    rows : [],
    "time": {
      "from": "now-15m",
      "to": "now"
    },
    "refresh": "10s",
};

row = {
    "height": "250px",
    "title": "Row",
    "collapse": false,
    "editable": true,
    "panels": []
    };

panels = [];

dashboard.title = graph;

function getPanel(srv) {
    {% for panel in ["RAM", "Network", "CPU", "LA", "DiskSaturation", "Connections", "DiskSpace", "AEDR", "DiskRW", "AEErrors"] %}
    templates.{{ panel }} = {{ lookup('template', panel + '.json')|replace('$server', "\" + srv + \"")|replace('$iface', "\" + iface + \"") }};
    console.log('{{ panel }}');
    {% endfor %}
    console.log(graph);
    console.log(templates[graph]);
    return templates[graph];
}

function addPanel(datasource, servers, i)
{
    var i = parseInt(i, 10);
    panel            = getPanel(servers[i].text);
    panel.span       = span;
    panel.id         = i + 1;
    panel.datasource = datasource.name;
    panel.title      = servers[i].text;
    console.log(panel);
    
    row.panels.push(panel);
    console.log(row);
    // if (span * (row.panels.length + 1) > 12)
    // {
    //     console.log('true, ' + span + " * " + (row.panels.length + 1) + ' > 12');
    // } else {
    //     console.log('false, ' + span + " * " + (row.panels.length + 1) + ' <= 12')
    // }
    // if ( servers.length == i + 1 )
    // {
    //     console.log('true, ' + servers.length + ' <= ' + ( i + 1) );
    // } else {
    //     console.log('false, ' + servers.length + ' > ' + ( i + 1) );
    // }
        
    // if (span * (row.panels.length + 1) > 12 || servers.length <= i + 1 )
    // {
    //     dashboard.rows.push(row);
    //     row.panels = [];
    // }
}


$.ajaxSetup({
    async: false
});

services.datasourceSrv.get(dsname).then(function(datasource) {
    console.log(datasource.url);
    $.getJSON(datasource.url + '/metrics/find/?query=telegraf.' + s, function(servers){
        // console.log(servers[0]);
        for (var i in servers) {
            console.log(servers[i].text);
            addPanel(datasource, servers, i);
        }
        
    });
});

$.ajaxSetup({
    async: true
});


dashboard.rows.push(row);
// console.log(dashboard);

return dashboard;
