var width = 700, height = 580;

dep_fr = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson"
data = "https://lyondataviz.github.io/teaching/lyon1-m2/2021/data/covid-06-11-2021.csv"

var svg = d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");
var projection = d3
    .geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(2800);

var color = d3.scaleQuantize()
    .range(["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"]);

var path = d3.geoPath().projection(projection);
var tooltip = d3.select('body').append('div')
    .attr('class', 'hidden tooltip');

var jourChoisi  = "2021-09-12"   
d3.csv(data).then(function(data) {

        var cleanData = data.filter( function (it) {
            return it.sexe == "0"          
          });
        color.domain([
            d3.min(cleanData, function(a) { 
                return a.hosp;  
            }),
            d3.max(cleanData, function(a) {
                return a.hosp; 
            })
        ]);

        d3.json(dep_fr).then(function(json) {
                 console.log(cleanData)
                 console.log(json.features)

            for (var i = 0; i < cleanData.length; i++) {
                var dataDay = cleanData[i].jour
                var dataDep = cleanData[i].dep;
                var dataHosp = parseInt(cleanData[i].hosp);
                for (var j = 0; j < json.features.length; j++) {
                    var jsonDep = json.features[j].properties.code;
                    if (dataDep == jsonDep && dataDay == jourChoisi ) {     
                        json.features[j].properties.value = dataHosp;
                        break;
                    }
                }
            }

            g.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", function(a) {

                    var value = a.properties.value;
                    if (value) {
                        return color(value);
                    } else {
                        return "#ccc";
                    }
                })
                .on('mousemove', function (e, a) {
                    var mousePosition = [e.x, e.y];
                    console.log(mousePosition);
                    tooltip.classed('hidden', false)
                        .attr('style', 'left:' + (mousePosition[0] + 15) +
                            'px; top:' + (mousePosition[1] - 35) + 'px')
                        .html(a.properties.nom);
                })
                .on('mouseout', function () {
                    tooltip.classed('hidden', true);
                });
        });
    });