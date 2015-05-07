<?php 
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers:{$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}
    error_reporting(E_ALL);

////////////////////////////////////////////////////////////////////////////////////////
// TWITTER API STUFF
////////////////////////////////////////////////////////////////////////////////////////

class TweetSentiment {
	public $tweet;
	public $sentiment;

	function __construct($t,$s) {
		$this->tweet = $t;
		$this->sentiment = $s;
	}

	function get_tweet_sentiment() {
		return 'Tweet: ' + $this->tweet + ' Sentiment:' + $this->sentiment;
	}

}


function classify ($sentiment) {

	$sentijson = json_decode($sentiment);

	$ppos = $sentijson->probability->pos;
	$pneu = $sentijson->probability->neutral;
	$pneg = $sentijson->probability->neg;

	if ( ($ppos > $pneg) && ($ppos > $pneu) ) {
		return 'pos';
	}
	else if ( ($pneg > $ppos) && ($pneg > $pneu) ) {
		return 'neg';
	}
	else {
		return 'neu';
	}

}

function get_positive ($sentiment) {
	$sentijson = json_decode($sentiment);

	$ppos = $sentijson->probability->pos;

	return $ppos;
}

function get_negative ($sentiment) {
	$sentijson = json_decode($sentiment);

	$pneg = $sentijson->probability->neg;
	
	return $pneg;
}


$N = 15; // Hard-coded number of tweets

require "twitteroauth/autoload.php";
use Abraham\TwitterOAuth\TwitterOAuth;

$access_token =  "62479244-Lom37k34KFp24wnWmSr8TLnHEycWFu4ROyGjdrWfV";
$access_token_secret =  "gVdM4CwStcp7yDjhGv9ONOt33v2YhLcYylEFgtx9YN5Vq";
$connection = new TwitterOAuth("FczCx4sYVC73yQUOomCjiHaXA",
							   "WrJZMaSB4c7tBcjRdmQhqV0GK8QuaAOZeRbsjxTgCqCpskL11z",
							   $access_token,
							   $access_token_secret);
$statuses = $connection->get("search/tweets",
							array("q" => $_GET['keyword'], "lang" => "en"));
#var_dump($statuses);

$ts = array();
$i = 0;
$sendsentiment = array();
$most_positive = 0;
$most_negative = 0;
$highest_pos = 0;
$highest_neg = 0;


////////////////////////////////////////////////////////////////////////////////////
// SENTIMENT ANALYSIS BEGINS HERE. I KNOW WHO'S NAUGHTY AND WHO'S NICE            //
////////////////////////////////////////////////////////////////////////////////////
$url = 'http://text-processing.com/api/sentiment/';
$n_negs = 0; # Number of negative tweets
$n_poss = 0; # Number of positive tweets
$n_neus = 0; # Number of neutral tweets

for ($i=0; $i<15; $i++) {
	$tmptweet = $statuses->statuses[$i]->text;
	$tmpsent = "something wrong";
	$screen_name = $statuses->statuses[$i]->user->screen_name; # temp
	$location = $statuses->statuses[$i]->user->location; # temp
	$latitude = 0.0;
	$longitude = 0.0;

	$data = array('text' => $tmptweet);

	$options = array(
	    'http' => array(
	        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
	        'method'  => 'POST',
	        'content' => http_build_query($data),
	    ),
	);
	$context  = stream_context_create($options);
	$result = file_get_contents($url, false, $context);

	$tmpsent = classify($result);

	$tmpmp = get_positive($result);
	$tmpmn = get_negative($result);

	if ( $tmpmp > $highest_pos ) {
		$highest_pos = $tmpmp;
		$most_positive = $i;

	}
	if ( $tmpmn > $highest_neg ) {
		$highest_neg = $tmpmn;
		$most_negative = $i;
	}

	// Get latitude and longitude here
	if($location != '') {
		$address = urlencode(trim($location));
		$gmap_url = 'http://maps.google.com/maps/api/geocode/json?address='.$address;

		$gmaps_get = file_get_contents($gmap_url);

		$gmaps_json = json_decode($gmaps_get,true);

		if($gmaps_json['status'] == 'OK') {
			$latitude = $gmaps_json['results'][0]['geometry']['location']['lat'];
			$longitude = $gmaps_json['results'][0]['geometry']['location']['lng'];
		}
		else {
			$location = '';
			$latitude = 0.0;
			$longitude = 0.0;
		}
	// Done getting all location data
	}

	$sendsentiment[$i]['tweet'] = $tmptweet;
	$sendsentiment[$i]['sentiment'] = $tmpsent;
	$sendsentiment[$i]['screen_name'] = $screen_name;
	$sendsentiment[$i]['location'] = $location;
	$sendsentiment[$i]['latitude'] = $latitude;
	$sendsentiment[$i]['longitude'] = $longitude;

	if(strcmp($tmpsent,'neg') == 0) {
		$n_negs += 1;
	} else if (strcmp($tmpsent,'pos') == 0) {
		$n_poss += 1;
	} else if (strcmp($tmpsent,'neu') == 0) {
		$n_neus += 1;
	}
}

$sendsentiment['mp'] = $most_positive;
$sendsentiment['mn'] = $most_negative;
$sendsentiment['negs'] = $n_negs;
$sendsentiment['poss'] = $n_poss;
$sendsentiment['neus'] = $n_neus;
echo json_encode($sendsentiment);




?> 