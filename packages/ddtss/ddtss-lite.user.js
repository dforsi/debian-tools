// ==UserScript==
// @name DDTSS Helper
// @description Add stuff to DDTSS pages
// @version 0.7
// @match https://ddtp2.debian.net/ddtss/index.cgi/*/forreview/*
// @match https://ddtp2.debian.net/ddtss/index.cgi/*/translate/*
// @grant GM_xmlhttpRequest
// ==/UserScript==
// Daniele Forsi
// Last update 14/10/2016
// Creative Commons Zero

// Add stuff near to the short description
var short_el = document.getElementsByName('short');
if (short_el[0]) {
  // Create a DIV and move the existing INPUT inside it
  var div_el = document.createElement('div');
  div_el.style = "display:inline-block;vertical-align:top;";
  short_el[0].parentNode.insertBefore(div_el, short_el.nextSibling);
  div_el.parentNode.insertBefore(short_el[0], div_el.nextSibling);

  // Add a list of suggestions for the short description
  function create_select(options, dest_el) {
    function createOption(value, text, style) {
      var option_el = document.createElement("option");
      option_el.value = value;
      option_el.text = text;
      option_el.style = style;
      return option_el;
    }
    function handler(e) {
      dest_el.value = e.target.value;
      dest_el.oninput();
    }
    var select_el = document.createElement("select");
    select_el.style = 'width:100%;text-align:right;padding-right:0.5em;';
    select_el.onchange = handler;
    // The first item shows the number of suggestions and resets the short description
    var header_option_el = createOption(dest_el.value, "Suggestions: " + options.length, 'text-align:right;');
    select_el.appendChild(header_option_el);
    for (var i = 0; i < options.length; i++) {
      var option_el = createOption(options[i].short_title, options[i].short_title, 'text-align:left;');
      select_el.appendChild(option_el);
    }
    return select_el;
  }
  div_el.appendChild(short_el[0]);
  div_el.appendChild(document.createElement('br'));

  // Add length of short description text
  var short_len_el = document.createElement('span');
  short_el[0].oninput = function () {
    short_len_el.innerHTML = ' length=' + short_el[0].value.length;
  }
  short_el[0].oninput();
  div_el.parentNode.insertBefore(short_len_el, div_el.nextSibling);
  function last(a) {
    return a[a.length - 1];
  }
  var parts = window.location.pathname.split('/');
  var language = parts[3];
  var package_name = last(parts);
  GM_xmlhttpRequest({
    method: "GET",
    url: "https://forsi.it/debian/packages/sid/suggest/suggest-short.php?language=" + language + "&package=" + package_name,
    headers: {"Accept": "application/json"},
    onload: function (response) {
      console.log("GM_xmlhttpRequest", response);
      var json = JSON.parse(response.responseText);
      short_el[0].parentNode.insertBefore(create_select(json.suggest_short, short_el[0]), short_el.nextSibling);
    }
  });
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
    var old_value, new_value;
    old_value = long_el[0].value;
    new_value = long_el[0].value.replace(long_re, '$1 $2');
    if (old_value != new_value) {
      long_el[0].value = new_value;
      var submit = document.getElementsByName("submit")
      submit[0].disabled = 0;
    }
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
