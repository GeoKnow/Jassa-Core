<?php


/**
 * A helper class to extract information about CSS and JS files from
 * a pom file.
 *
 */
class PomJsHelper {
    private $pomXml;
	private $prefix;

    // TODO Read the path from the pom file
    private $minDir;
	

    public function __construct($pomXml, $prefix, $minDir) {
        $this->pomXml = $pomXml;
        $this->prefix = $prefix;
        $this->minDir = $minDir;
    }
    
    function getJsMinFiles() {
    	$minDir = $this->minDir;
    	$prefix = $this->prefix;

    	$result = array("{$minDir}js/{$prefix}min.js");
    	return $result;
    }

	public function getCssMinFiles() {
    	$minDir = $this->minDir;
    	$prefix = $this->prefix;
	
	
    	$result = array("{$minDir}css/{$prefix}min.css");
    	return $result;
	}


	public static function getStringFromXml($xml, $xpath) {
    	$tmp = $xml->xpath($xpath);
    	$result = $tmp ? $tmp[0] : FALSE; 

    	return $result;
	}

	public static function getWebappDir($pomXml) {
    	//return "src/main/webapp";
    	//return ".";
    	return ""; //"resources/";
	}

	public static function getJsSourceDir($pomXml) {
    	$result = PomJsHelper::getStringFromXml($pomXml, "//*[local-name()='jsSourceDir']");
    	return $result;
	}

	
	public static function getCssSourceDir($pomXml) {
    	$result = PomJsHelper::getStringFromXml($pomXml, "//*[local-name()='cssSourceDir']");
    	return $result;
	}


	public function getJsSourceFiles() {
		$pomXml = $this->pomXml;
	
	    $fileNames = $pomXml->xpath("//*[local-name()='jsSourceFiles']/*[local-name()='param']");

    	$webappDir = PomJsHelper::getWebappDir($pomXml);
    	$jsSourceDir = PomJsHelper::getJsSourceDir($pomXml);
    	$prefix = $webappDir . $jsSourceDir;
    	$result = PomJsHelper::addPrefix($prefix, $fileNames);

    	return $result;
	}

	public function getCssSourceFiles() {
		$pomXml = $this->pomXml;

    	$fileNames = $pomXml->xpath("//*[local-name()='cssSourceFiles']/*[local-name()='param']");

    	$webappDir = PomJsHelper::getWebappDir($pomXml);
    	$cssSourceDir = PomJsHelper::getCssSourceDir($pomXml);
    	$prefix = $webappDir . $cssSourceDir;
    	$result = PomJsHelper::addPrefix($prefix, $fileNames);

    	return $result;
	}

	public static function addPrefix($prefix, $strs) {
    	$result = array();
    	foreach($strs as $str) {
        	$result[] = $prefix . $str;
    	}
    	return $result;
	}

	public static function toStringJsTags($fileNames) {
    		$result = "";
    	foreach($fileNames as $fileName) {
        	$result .= PomJsHelper::toStringJsTag($fileName) . "\n";
    	}
    	return $result;
	}

	public static function toStringJsTag($fileName) {
    	$result = '<script type="text/javascript" src="' . $fileName . '"></script>';
    	return $result;
	}


	public static function toStringCssTags($fileNames) {
    	$result = "";
    	foreach($fileNames as $fileName) {
        	$result .= PomJsHelper::toStringCssTag($fileName) . "\n";
    	}
    	return $result;
	}

	public static function toStringCssTag($fileName) {
   		$result = '<link rel="stylesheet" type="text/css" href="' . $fileName. '" />';
   		return $result;
	}
   
}


// TODO Clean up below

function parse_properties_file($fileName) {
    $str = file_get_contents($fileName);
    $result = parse_properties($str);
    return $result;
}

#Source: http://blog.rafaelsanches.com/2009/08/05/reading-java-style-properties-file-in-php/
function parse_properties($txtProperties) {
 $result = array();

 $lines = explode("\n", $txtProperties);
 $key = "";

 $isWaitingOtherLine = false;
 foreach($lines as $i=>$line) {

 if(empty($line) || (!$isWaitingOtherLine && strpos($line,"#") === 0)) continue;

 if(!$isWaitingOtherLine) {
 $key = substr($line,0,strpos($line,'='));
 $value = substr($line,strpos($line,'=') + 1, strlen($line));
 }
 else {
 $value .= $line;
 }

 /* Check if ends with single '\' */
 if(strrpos($value,"\\") === strlen($value)-strlen("\\")) {
 $value = substr($value, 0, strlen($value)-1)."\n";
 $isWaitingOtherLine = true;
 }
 else {
 $isWaitingOtherLine = false;
 }

 $result[$key] = $value;
 unset($lines[$i]);
 }

 return $result;
}

