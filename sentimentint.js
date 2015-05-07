$(document).ready(function(){

    jnegs = 0;

    function display_meter() {
            var gaugeOptions = {

            chart: {
                type: 'solidgauge'
            },

            title: null,

            pane: {
                center: ['50%', '85%'],
                size: '140%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#787777',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },

            tooltip: {
                enabled: true
            },

            // the value axis
            yAxis: {
                stops: [
                    [0.1, '#55BF3B'], // green
                    [0.5, '#DDDF0D'], // yellow
                    [0.8, '#DF5353'] // red
                ],
                lineWidth: 0,
                minorTickInterval: null,
                tickPixelInterval: 120,
                tickWidth: 0,
                title: {
                    y: -70
                },
                labels: {
                    y: 16
                }
            },

            plotOptions: {
                solidgauge: {
                    dataLabels: {
                        y: 5,
                        borderWidth: 0,
                        useHTML: true
                    }
                }
            }
        };

        // The speed gauge
        $('#container-speed').highcharts(Highcharts.merge(gaugeOptions, {
            yAxis: {
                min: 0,
                max: 15,
                title: {
                    text: 'Hate Meter',
                    style: {
                        color: 'dark grey'
}                },
                labels: {
                    style: {
                        color: 'dark grey'
                    }
                }
            },

            credits: {
                enabled: false
            },

            series: [{
                name: 'Hate meter',
                data: [5],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                        ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                           '<span style="font-size:12px;color:black"></span></div>'
                },
                tooltip: {
                    valueSuffix: ' of the tweets are negative'
                }
            }]

        }));

     
        // Bring life to the dials
        setInterval(function () {
            // Speed
            var chart = $('#container-speed').highcharts(),
                point,
                newVal,
                inc;

            if (chart) {
                point = chart.series[0].points[0];
                newVal = jnegs;

                point.update(newVal);
            }
        }, 2000);

    }

    function display_histogram (n_poss, n_negs, n_neus) {
        var chart = new Highcharts.Chart({

            chart: {
                spacingBottom: 0,
                spacingTop: 0,
                spacingLeft: -22,
                spacingRight: 0,        
                renderTo: 'container-histo',
                type: 'column',
                backgroundColor:'rgba(0, 0, 0, 0)'
            },
            title: {
                text: 'Sentiment Histogram',
                style: {
                    color: 'dark grey'
                }
            },

            xAxis: {
                categories: ['Positive', 'Negative', 'Neutral'],

                labels: {
                    style: {
                        color: 'dark grey'
                    }
                }
                
            },
            
            yAxis: {
                gridLineWidth: 0,
                minorGridLineWidth: 0,
                 labels: {
                    enabled: false,
                    style: {
                        color: 'dark grey'
                    }
                }       
            },
            
            
            plotOptions: {
                column: {
                    groupPadding: 0,
                    pointPadding: 0,
                    borderWidth: 0
                }
            },

            series: [{
                showInLegend: false,
                data: [{y: n_poss, color: '#228B22'},{y: n_negs, color: '#D42436'}, {y: n_neus, color: '#000080'}]
            }],
            credits: {
              enabled: false
            }

        });

    }

    // A class Point, that represents a point in datamaps
    var Point = function(name,fillKey,latitude,longitude) {
            this.name  = name;
            this.fillKey = fillKey;
            this.radius = 3.5,
            this.latitude = latitude;
            this.longitude = longitude;
            };


    function printTweets(myJSON) {
        var most_negative = myJSON.mn;
        var most_positive = myJSON.mp;

        // Get number of positives, negatives and neutral tweets for histogram
        var n_poss = myJSON.poss;
        var n_negs = myJSON.negs;
        var n_neus = myJSON.neus;

        $('svg.datamap').remove(); // Clear any datamaps so that new ones can be plotted
        $('.datamaps-hoverover').remove(); // Clear hoverovers
        $('#container-histo').empty(); // Clear histogram


        var bubble_map = new Datamap({
            element: document.getElementById("bubbles"),
            geographyConfig: {
                popupOnHover: false,
                highlightOnHover: false
            },
            fills: {
                defaultFill: '#787777',
                neg: 'red',
                pos: 'green',
                neu: 'blue'
            }
        });


        var N = 15; // Number of tweets hardcoded
        var tweets = '<ul class="list-group">';
        var loc = '';
        var screen_name = '';
        var tsent = '';
        var tlat = 0.0;
        var tlng = 0.0;
        var has_geo = false;
        //var address = 'http://maps.googleapis.com/maps/api/geocode/json?address=';

        var points = Array();
        var num_points = 0;


        for (var i=0;i<15;i++) {
            if (i==most_negative) {
                tweets += '<li class="list-group-item list-group-item-danger">'+myJSON[i].tweet+'</li>';
            }
            else if(i==most_positive) {
                tweets += '<li class="list-group-item list-group-item-success">'+myJSON[i].tweet+'</li>';
            }
            else {
                tweets += '<li class="list-group-item">'+myJSON[i].tweet+'</li>';
            }
            loc = myJSON[i].location;
            screen_name = myJSON[i].screen_name;
            tsent = myJSON[i].sentiment;
            tlat = myJSON[i].latitude;
            tlng = myJSON[i].longitude;

            //loc = 'New York'
            if (loc.length != 0) {
                points[num_points] = new Point(screen_name,tsent,parseFloat(tlat),parseFloat(tlng));
                num_points++;
            }

        }
        tweets += '</ul>';

        bubble_map.bubbles(points);

        jnegs = myJSON.negs;
        display_meter();
        display_histogram(n_poss,n_negs,n_neus);
        $('#disptweets').html(tweets);
    }



    $('#mainform').validate({ // initialize the plugin
        rules: {
            keyword: {
                required: true
            }
        },
        messages: {
            keyword: "Please enter a keyword"
        },
        submitHandler:  function(form) {
                $.ajax({
                    //url: 'http://sentimentint2-env.elasticbeanstalk.com/sentiment/sentimentint.php',
                    url: 'sentimentint.php',
                    type: 'GET',
                    data: $('#mainform').serialize(),
                    success: function(result) {
                        myJSON = JSON.parse(result);
                        printTweets(myJSON);
                    },
                    error: function() {
                        alert("error");
                    }
                });
        },
        highlight: function(element) {
            $(element).closest('.groupvalidation').addClass('has-error');
        },
        unhighlight: function(element) {
                $(element).closest('.groupvalidation').removeClass('has-error');
        },
        errorElement:"span",
        errorClass:"errClass",
        errorPlacement: function(error, element) {
            error.insertAfter(element);
        }        
      });
      $('#keyword').focusout('keyup',function() {$('#keyword').valid();});


      $('#clearbtn').click(function () {
        $('#mainform').trigger('reset');
        $('#disptweets').empty();
        $('svg').html('');
        $('svg.datamap').remove();
        $('.datamaps-hoverover').remove();
        $('.highcharts-data-labels').html('');
        $('#container-histo').empty(); 
      });
});