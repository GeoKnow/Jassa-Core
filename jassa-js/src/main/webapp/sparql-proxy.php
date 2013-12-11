<?php

// Unless we succeed we fail
header('HTTP/1.1 500 Internal Server Error', true, 500);
error_reporting(E_ALL);


/*****************************************************************************/
/* Configuration                                                             */
/*****************************************************************************/

// Note: The defaultServiceUrl is not subject to proxy url validation.
$defaultServiceUrl = "http://localhost:8890/sparql";


// For security reasons, only SPARQL query string parameters are forwarded.
$allowedParams = array("format", "query", "timeout", "default-graph-uri");



$serviceUrl = null;

// Request headers that should not be forwarded to the target address
$ignoreRequestHeaders = array("host");


// Response headers that should not be returned to the client
// We ignore transfer encoding because curl already retrieves the full response
// Note: Unfortunately no streaming - feel free to contribute :)
$ignoreResponseHeaders=array("transfer-encoding");


/*****************************************************************************/
/* Utility                                                                   */
/*****************************************************************************/
function isCurlAvailable() {
	//$result = function_exists('curl_version') == 'Enabled';
	$result = is_callable('curl_init');
	return $result;
}

if(!isCurlAvailable()) {
	//header('HTTP/1.1 500 Internal Server Error');
	//header('HTTP/1.1 200 OK');

	//throw new Exception('Curl is not available on this system.');
	echo "Cannot serve request because PHP curl is not available.";
	die;

	//return 1;
}



/*****************************************************************************/
/* Business Logic                                                            */
/*****************************************************************************/

function validateProxyUrl($url) {
	$u = parse_url($url);

	$scheme = isset($u["scheme"]) ? $u["scheme"] : "";
	if(strcmp($scheme, "http") != 0) {
        	echo "Only http scheme is allowed for proxying";
	        die;
	}

	// TODO Check for user, pass, query; rather than just discarding them silently

	$host = $u["host"];
        $port = isset($u["port"]) ? (":" . $u["port"]) : "";
	$path = $u["path"];

	$result = "$scheme://$host$port$path";

	return $result;
}

if(isset($_REQUEST['service-uri'])) {
	$rawServiceUrl = $_REQUEST['service-uri'];

	$serviceUrl = validateProxyUrl($rawServiceUrl);
} else {
	$serviceUrl = $defaultServiceUrl;
}

//echo "ServiceUrl: $serviceUrl\n\n";

$args = $_SERVER['QUERY_STRING'];


$validArgs = array();
$qs = explode("&", $args);
foreach($qs as $item) {
	$kv = explode("=", $item, 2);
	
	$key = $kv[0];
	
//echo "item: $item --- $key \n";

	if(in_array($key, $allowedParams)) {
		array_push($validArgs, $item);
	}
}

$validArgsStr = implode("&", $validArgs);


// TODO Security issue: filter the query string for valid parameters
$finalUrl = "$serviceUrl?$validArgsStr";


//echo "Final URL: $finalUrl\n";

// NOTE getallheaders only works with apache - see http://php.net/manual/en/function.getallheaders.php
$requestHeaders = getallheaders();


//print_r($requestHeaders);


$headers = array();
foreach($requestHeaders as $k => $v) {

	if(in_array(strtolower($k), $ignoreRequestHeaders)) {
		continue;
	}

	array_push($headers, "$k: $v");
}


//print_r($headers);



// Prepare and perform the request
$ch = curl_init();
if($ch === FALSE) {
    echo "Failed to initialize curl";
    die;
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

curl_setopt($ch, CURLOPT_URL, "$finalUrl");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);
if($response === FALSE) {
    $errMsg = curl_error($ch);
    $errCode = curl_errno($ch);

    echo "Error communicating with service at: $serviceUrl\n";
    echo "Curl error code $errCode: $errMsg";
    die;
}


//echo "Response is $response\n";

$info = curl_getinfo($ch);
curl_close($ch);


//error_log($info['download_content_length']);
//error_log($response);
//$httpStatus = $info['CURLINFO_HTTP_CODE'];
//header('HTTP/1.1 200 OK', true, 200);
//echo "Status: $httpStatus";

$statusCode = $info['http_code'];

$headerSize = $info['header_size'];
$responseHeader = substr($response, 0, $headerSize);
$body = substr($response, $headerSize);


// The old way I used breaks with chunked transfer - lets of the current
// approach is more robust
##$body = substr($response, -$info['download_content_length']); 


//$statusMsg = "HTTP/1.1 200 OK";
// Exclude ignored response headers
foreach (explode("\r\n",$responseHeader) as $hdr) {
        $tmp = explode(":", $hdr, 2);
	if(count($tmp) != 2) {
		// This is the HTTP status code
		$statusMsg = $tmp[0];
        } else {

		list($k, $v) = $tmp;
		$k = strtolower(trim($k));

		if($k == '' || in_array($k, $ignoreResponseHeaders)) {
			continue;
		}
	}

    header($hdr);
}

//header('HTTP/1.1 200 OK', true, 200);
//echo $statusMsg;
//die;
//header($statusMsg, true, $statusCode);
echo "$body";

