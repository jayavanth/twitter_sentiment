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
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
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
                       '<span style="font-size:12px;color:silver"></span></div>'
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

    function printTweets(myJSON) {
        var most_negative = myJSON.mn;
        var most_positive = myJSON.mp;

        // var neg_indicator = 'list-group-item-danger';
        // var pos_indicator = 'list-group-item-success';

        var N = 15; // Number of tweets hardcoded
        var tweets = '<ul class="list-group">';

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
        
        }
        tweets += '</ul>';

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
        $('.highcharts-data-labels').html('');
      });
});