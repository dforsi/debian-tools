// ==UserScript==
// @name DDTSS Helper
// @description Add stuff do DDTSS pages
// @version 0.1
// @match https://ddtp.debian.net/ddtss/index.cgi/*/forreview/*
// @match https://ddtp.debian.net/ddtss/index.cgi/*/translate/*
// @grant none
// ==/UserScript==
// Daniele Forsi 19/12/2015
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

// Add link to reflow the long description
var long_el = document.getElementsByName('long');
if (long_el[0]) {
  var re = /([^.])\n([^ .])/gm;
  var button = document.createElement('button');
  var text = document.createTextNode('Join');
  button.appendChild(text)
  button.onclick = function () {
    long_el[0].value = long_el[0].value.replace(re, '$1 $2');
    return false;
  }
  long_el[0].parentNode.insertBefore(button, long_el.nextSibling);
}

// Add link to p.d.o
var ul_el = document.getElementsByTagName('ul');
if (ul_el[0]) {
  var matches = /forreview\/(.+)\?/.exec(document.URL);
  if (matches == null) {
    var matches = /translate\/(.+)/.exec(document.URL);
  }
  var package_name = matches[1];
  var li_el = document.createElement('li');
  var a_el = document.createElement('a');
  a_el.href = 'https://packages.debian.org/en/sid/' + package_name;
  a_el.innerHTML = package_name;
  a_el.target = '_blank';
  li_el.appendChild(a_el);
  ul_el[0].appendChild(li_el);
}
