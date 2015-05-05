$(document).ready(function(){

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

});