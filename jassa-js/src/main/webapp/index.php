<?php
    $prefix = "jassa";

	$basePath = "resources/";

    include_once("index-utils.php");

    $pomFile = "resources/conf/{$prefix}.pom.xml";
    $pomXml = simplexml_load_file($pomFile);
    $minDir = "../../../jassa-js/target/jassa-js/webapp/";

    $pomJsHelper = new PomJsHelper($pomXml, $prefix, $minDir);

	// Read ini settings 
	$ini = parse_properties_file("$basePath/conf/{$prefix}.index.properties");

    // If debug is false: include minimized JavaScript, otherwise include original source
    
    $debug = $ini["{$prefix}.debug"];
	$templateFile = "WEB-INF/jsp/" . $ini["{$prefix}.templateFile"];


    if($debug) {
        $cssFileNames = $pomJsHelper->getCssSourceFiles();
        $jsFileNames = $pomJsHelper->getJsSourceFiles();
    } else {
        $cssFileNames = $pomJsHelper->getCssMinFiles();
        $jsFileNames = $pomJsHelper->getJsMinFiles();
    }

    $cssIncludes = PomJsHelper::toStringCssTags($cssFileNames);
    $jsIncludes = PomJsHelper::toStringJsTags($jsFileNames);


	// Load facete-index.jsp and regex replace the placeholders
	$content = file_get_contents($templateFile);

	// TODO Make this more generic: Locate all ${}s in the content and then load the values
	// from e.g. an ini section
	//$content = preg_replace("/\\$\{title\}/s", $title, $content);
	$content = preg_replace("/\\$\{cssIncludes\}/s", $cssIncludes, $content);
	$content = preg_replace("/\\$\{jsIncludes\}/s", $jsIncludes, $content);
	
	
	//$headerHtml = file_get_contents($headerFile);
	//$content = preg_replace("/\\$\{headerHtml\}/s", $headerHtml, $content);


	// Disable caching; source: http://james.cridland.net/code/caching.html
	header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
	header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
	header("Cache-Control: no-store, no-cache, must-revalidate");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");	
	
	echo $content;
