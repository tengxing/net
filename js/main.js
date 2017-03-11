var graph;
var last_value =""
var highlighted_index = 0;

var nodes,edges;

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    transform = d3.zoomIdentity;
var g = svg.append("g")
var color = d3.scaleOrdinal(d3.schemeCategory20);

svg.call(d3.zoom()
			.filter(function filter() {
  				return d3.zoom().scaleTo(0.1);
			}))
   		.call(d3.zoom()
   			.scaleExtent([0.1, 2])
      		.on("zoom", zoomed)
      	);

function zoomed() {
	  		g.attr("transform", d3.event.transform);
}

function init(){
	d3.json("dd.json", function(error, data) {
	  if (error) throw error;
		  graph = data;
		  nodes = graph.nodes;
		  edges = graph.edges;
		  canvas(data,g);
	});
}



function canvas(data,dom){
	var g =dom;
	var simulation = d3.forceSimulation()
	    .force("link", d3.forceLink().id(function(d) { return d.id; }))
	    .force("charge", d3.forceManyBody())
	    .force("center", d3.forceCenter(width / 2, height / 2))
	    .alpha(0.01);
	simulation.nodes(data.nodes)
			  .on("tick", ticked)
			  .force("link")
			  .links(data.edges);

	var link = g.selectAll("line")
    .data(data.edges)
    .enter().append("line")
    .attr("stroke",function (d) { return d.color; })
    .attr("stroke-width", function(d) { return 4; });
    

    var node = g.selectAll("circle")
	    .data(data.nodes)
	    .enter().append("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
	    .attr("r", function(d) { return d.size; })
	    .attr("fill", function(d) { return d.color; })
	    .on("click",click)//收起子节点
        .call(d3.drag()
		    .on("start", dragstarted)
		    .on("drag", dragged)
		    .on("end", dragended)); 
	    

	var text = g.selectAll("text")
    	.data(data.nodes)
    	.enter()
    	.append("text")
    	.attr("fill",function(d){ return d.color; })
    	.attr("display","none")
	    .attr("dx", 20)
	    .attr("dy", 8)
	    .text(function(d){
	        return d.id;
	    });

	  // var text = g.selectAll("text").style("display","none");

	node.append("title")
	    .text(function(d) { return d.label; });
	link.append("title")
	    .text(function(d) { return d.label; });

	function zoomed() {
	  		g.attr("transform", d3.event.transform);
	}

	function ticked() {
	    link
	        .attr("x1", function(d) { return d.source.x; })
	        .attr("y1", function(d) { return d.source.y; })
	        .attr("x2", function(d) { return d.target.x; })
	        .attr("y2", function(d) { return d.target.y; });

	    node
	        .attr("cx", function(d) { return d.x; })
	        .attr("cy", function(d) { return d.y; });

	    text
	    	.attr("x", function(d){ return d.x; })
	        .attr("y", function(d){ return d.y; });

	    /*textlinkText
	    	.attr("x", function(d){ return d.x; })
	        .attr("y", function(d){ return d.y; });*/
	  	}
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

	function click(d) {
		if(d.id){
	   		selectGene(d.id);
	   	}
	}
}

function showResult() {
	var key = d3.event.keyCode;

	if (key == 13) { // Enter/Return key
		selectGene(d3.select("#select_" + highlighted_index).property("value"));
		highlighted_index = 0;
		return;
	} else if (key == 40) { // down arrow
		d3.select("#select_" + highlighted_index).style("background-color","#ffffff");
		highlighted_index++;
		d3.select("#select_" + highlighted_index).style("background-color","#eeeeee");
		return;
	} else if (key == 38) { // up arrow
		d3.select("#select_" + highlighted_index).style("background-color","#ffffff");
		highlighted_index--;
		d3.select("#select_" + highlighted_index).style("background-color","#eeeeee");
		return; 
	}

	var str = this.value;
	if (str == last_value) {
		return;
	}
	if (str.length==0) { 
		d3.select("#livesearch").html("");
		d3.select("#livesearch").style("border","0px");
		return;
	}

	var search_value = str.toLowerCase();

	var max_suggestions_to_show = 10;
	var suggestions = "";
	var num_suggestions = 0;
	for (var i in nodes) {
		if ((nodes[i].label.toLowerCase()).indexOf(search_value) != -1) {
			suggestions += '<p value="' + i + '" id="select_' + num_suggestions + '" onclick="selectGene(' + i + ')">' + nodes[i].label + ""+'</p>'+"<br />";
			num_suggestions++;
			if (num_suggestions > max_suggestions_to_show) {
				suggestions += '<p>...</p>';
				break;
			}
		}
	}
	if (suggestions == "") {
		suggestions = "not find";
	} 

	d3.select("#livesearch").html(suggestions);
	d3.select("#livesearch").style("border","1px solid #A5ACB2");

	console.log("highlighting:");
	console.log(highlighted_index);
	d3.select("#select_" + highlighted_index).style("background-color","#eeeeee");

	last_value = str;
}

//find a group by id
function findGroupById(d){
   var groupGraph ={};
   var nodes = eval(graph.nodes);
   var edges = eval(graph.edges);
   var groupNodes = [],groupEdges = [];
   var source,target;
   var neighbors = [];
   neighbors.push(d);
             $(edges).each(function(index) {
                var val = edges[index];
                if (val.source.id==d) { 
                	groupEdges.push(val);
                  	neighbors.push(val.target.id);
                  //alert(neighbors.length);
                    /*$(val.summary).each(function(ind) {
                        alert(val.Title + " " + val.Content + " " + val.summary[ind].sum0);
                    });*/
                } else if(val.target.id==d) {
                   groupEdges.push(val);
                   neighbors.push(val.source.id);
                } else{

                }
            });
             //遍历id返回nodes
            $(neighbors).each(function(index) {
                var ids = neighbors[index];
                $(nodes).each(function(i) {
                	if(nodes[i].id == ids){
                		groupNodes.push(nodes[i]);
                	}
                });    
            });
            groupGraph = {
                    "nodes": groupNodes,
                    "edges": groupEdges
                }
            
        return groupGraph;
}

function selectGene(index) {
	var connections = [];
	var neighbors = "";
	var groupGraph = findGroupById(index); 
	g = d3.select("g").remove("g");
	g = d3.select("svg").append("g");
	console.info(groupGraph)
	canvas(groupGraph,g);
	//g = d3.select(".sigma-expand").append("svg").append("g");
	//group =update(groupGraph);

	d3.select("#livesearch").html("");
	d3.select("#livesearch").style("border","0px");
	d3.select("#search_input").property("value","");
	

	var attribute;
	var attributes = "";
	for(var i in groupGraph.nodes){
		connections.push(groupGraph.nodes[i].label);
		neighbors += '<a href="#'+groupGraph.nodes[i].label+'"onclick="selectGene('+groupGraph.nodes[i].id+')">'+groupGraph.nodes[i].label+'</a><br>';
		if(groupGraph.nodes[i].id == index){
			attribute = groupGraph.nodes[i].attributes;
		}
	}

		attributes += '加权度:<li value="'+attribute["加权度"]+'">'+attribute["加权度"]+'</li><br>';
		attributes += 'Modularity Class:<li value="'+attribute["Modularity Class"]+'">'+attribute["Modularity Class"]+'</li><br>';
		attributes += 'Eccentricity:<li value="'+attribute["Eccentricity"]+'">'+attribute["Eccentricity"]+'</li><br>';
		attributes += 'Authority:<li value="'+attribute["Authority"]+'">'+attribute["Authority"]+'</li><br>';
		attributes += 'Weighted In-Degree:<li value="'+attribute["Weighted In-Degree"]+'">'+attribute["Weighted In-Degree"]+'</li><br>';
		attributes += 'PageRank:<li value="'+attribute["PageRank"]+'">'+attribute["PageRank"]+'</li><br>';
		attributes += 'Harmonic Closeness Centrality:<li value="'+attribute["Harmonic Closeness Centrality"]+'">'+attribute["Harmonic Closeness Centrality"]+'</li><br>';
		attributes += '连出度:<li value="'+attribute["连出度"]+'">'+attribute["连出度"]+'</li><br>';
		attributes += 'Strongly-Connected ID:<li value="'+attribute["Strongly-Connected ID"]+'">'+attribute["Strongly-Connected ID"]+'</li><br>';
		attributes += 'Weighted Out-Degree:<li value="'+attribute["Weighted Out-Degree"]+'">'+attribute["Weighted Out-Degree"]+'</li><br>';
		attributes += 'Closeness Centrality:<li value="'+attribute["Closeness Centrality"]+'">'+attribute["Closeness Centrality"]+'</li><br>';
		attributes += 'Hub:<li value="'+attribute["Hub"]+'">'+attribute["Hub"]+'</li><br>';
		attributes += 'Component ID:<li value="'+attribute["Component ID"]+'">'+attribute["Component ID"]+'</li><br>';
		attributes += 'Eigenvector Centrality:<li value="'+attribute["Eigenvector Centrality"]+'">'+attribute["Eigenvector Centrality"]+'</li><br>';
		attributes += 'Clustering Coefficient:<li value="'+attribute["Clustering Coefficient"]+'">'+attribute["Clustering Coefficient"]+'</li><br>';
		attributes += 'Betweenness Centrality:<li value="'+attribute["Betweenness Centrality"]+'">'+attribute["Betweenness Centrality"]+'</li><br>';
		attributes += '连入度:<li value="'+attribute["连入度"]+'">'+attribute["连入度"]+'</li><br>';
		
	
	close();
	d3.select("#nodeattributes").html(attributes);
	d3.select("#neighbors").html(neighbors);
	d3.select("#attributepane").attr("style","display:block");

}
//close the 
d3.select(".left-close").on("click",close);
function close(){
 	d3.select("#attributepane").attr("style","display:none");
 }
init();
d3.select("#search_input").on("keyup",showResult);
$("#showLabel").click(function(){
	
	var show = d3.selectAll("text").attr("display");
  	if(show=="none"){
  		g.selectAll("text").style("display","block");
  	}else{
  		g.selectAll("text").style("display","none");
  	}
  });
$("#initShow").click(function(){
	init();
});


