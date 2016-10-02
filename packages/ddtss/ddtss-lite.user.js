// ==UserScript==
// @name DDTSS Helper
// @description Add stuff to DDTSS pages
// @version 0.7
// @match https://ddtp2.debian.net/ddtss/index.cgi/*/forreview/*
// @match https://ddtp2.debian.net/ddtss/index.cgi/*/translate/*
// @grant none
// ==/UserScript==
// Daniele Forsi
// Last update 02/10/2016
// Creative Commons Zero

// Add description length
var short_el = document.getElementsByName('short');
if (short_el[0]) {
  var short_len_el = document.createElement('span');
  short_el[0].oninput = function () {
    short_len_el.innerHTML = ' length=' + short_el[0].value.length;
  }
  short_el[0].parentNode.insertBefore(short_len_el, short_el.nextSibling);
  short_el[0].oninput();
}

// Add button to reflow the long description
var long_el = document.getElementsByName('long');
if (long_el[0]) {
  // remove newlines that don't mark the end of a paragraph
  var long_re = /([^.])\n([^ .])/gm;
  var button = document.createElement('button');
  var text = document.createTextNode('Join');
  button.appendChild(text)
  button.onclick = function () {
    long_el[0].value = long_el[0].value.replace(long_re, '$1 $2');
    return false;
  }
  long_el[0].parentNode.insertBefore(button, long_el.nextSibling);
}

function addWebsiteLinks(element, isSourcePackage) {
  var el = element.children[0];
  var re = /([^.]+.: )([^ ,]+)(.*)/;
  var packagesFragment = isSourcePackage ? 'source/' : '';
  var ddtpFragment = isSourcePackage ? 'source' : 'package';
  el.innerHTML = el.innerHTML.replace(re,
    '$1<a href="https://packages.debian.org/' + packagesFragment + 'sid/$2" target="_blank">$2</a>' +
    ' <a href="https://ddtp2.debian.net/ddt.cgi?' + ddtpFragment + '=$2" target="_blank">ddtp</a>' +
    ' <a href="https://bugs.debian.org/$2" target="_blank">bugs</a>' +
    '$3');
}

// Add links to web sites
var ul_el = document.getElementsByTagName('ul');
if (ul_el[0]) {
  addWebsiteLinks(ul_el[0].children[0], true);
  addWebsiteLinks(ul_el[0].children[1], false);
}

// Convert timestamps into dates
// Obtain all <pre> tags
var all_log_tags = document.getElementsByTagName('pre');
// Find the one containing logs
for (n in all_log_tags) {
  log_tag = all_log_tags[n];
  if (log_tag.innerHTML.search(/\d{10} fetched/) != -1) {
    // Convert timestamps
    log_tag.innerHTML = log_tag.innerHTML.replace(/\d{10}/g, function (timestamp) {var date = new Date(1000*timestamp); return date.toLocaleString();});
  }
}
