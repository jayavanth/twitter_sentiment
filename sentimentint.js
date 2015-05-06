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
                    text: 'Hate Meter'
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

    // A class Point, that represents a point in datamaps
    var Point = function(name,fillKey,latitude,longitude) {
            this.name  = name;
            this.fillKey = fillKey;
            this.radius = 3,
            this.latitude = latitude;
            this.longitude = longitude;
            };


    function printTweets(myJSON) {
        var most_negative = myJSON.mn;
        var most_positive = myJSON.mp;

        $('svg.datamap').remove(); // Clear any datamaps so that new ones can be plotted
        $('.datamaps-hoverover').remove(); // Clear hoverovers


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
                neu: 'white'
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
      });
});