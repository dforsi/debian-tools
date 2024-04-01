// ==UserScript==
// @name     Copy older translation
// @version  2
// @grant    GM.xmlHttpRequest
// @grant    GM_xmlhttpRequest
// @match https://ddtp.debian.org/ddtss/index.cgi/*/translate/*
// Daniele Forsi
// Last update 19/01/2019
// Creative Commons Zero
// ==/UserScript==

function replace_trans(text)
{
  var changed = false;
  var textarea_el = document.getElementsByName("long");
  if (textarea_el) {
    textarea = textarea_el[0].value;
    //console.log(textarea);
    // discard title
    text.shift();
    var old_parts = text.join("\n").split("\n.\n");
    console.log("old_parts", old_parts);
    var new_parts = textarea.trim().split("\n.\n");
    console.log("new_parts", new_parts);
    for (var i = 0; i < new_parts.length; i++) {
      if (new_parts[i] == '<trans>' && old_parts[i] !== undefined) {
        new_parts[i] += "\n" + old_parts[i];
        changed = true;
      }
    }
    console.log("new_parts", new_parts);
    if (changed) {
      textarea_el[0].value = new_parts.join("\n.\n");
    }
  }

  return changed;
}

function get_old_translation_url()
{
  var pre = document.getElementsByTagName('pre');
  if (pre) {
    var lines = pre[pre.length - 1].textContent.split("\n");
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('# Description-id: ')) {
        var url = lines[i].replace(/# Description-id: (.*) (.*)/, "$2");
        //console.log(url);
        var language = lines[i + 1].replace(/# patch (.*)(&language=.*)/, "$2");
        //console.log(language);
        return url + language;
      }
    }
  }

  return false;
}

function merge_old_translation_text()
{
  var old_translation_url = get_old_translation_url();
  if (old_translation_url) {
    console.log("GET", old_translation_url);
    try {
      request = GM.xmlHttpRequest; // GreaseMonkey
    } catch {
      request = GM_xmlhttpRequest; // ViolentMonkey
    }
    request({
      method: "GET",
      url: old_translation_url,
      onload: function (response) {
        //console.log("GM_xmlhttpRequest", response);
        //console.log("GM_xmlhttpRequest", response.responseText);
        var re = /The it-translation:<br>[\s\S]<pre>[\s\S]Description-..: ([\s\S]*?)[\s\S]<\/pre>/;
        var text = re.exec(response.responseText);
        if (text != null) {
          // split and discard indent
          text = text[1].split("\n ");
          return replace_trans(text);
        }
      }
    });
  }

  return false;
}

function merge_english_text()
{
  var ul = document.getElementsByTagName('ul');
  var li = ul[2].getElementsByTagName('li');
  // The first line is the constant "Untranslated:" which acts as a dummy title
  var text = li[0].innerText.trim().split("\n ");
  return replace_trans(text);
}

function add_button_merge_old()
{
  var long_el = document.getElementsByName('long');
  if (long_el[0]) {
    var button = document.createElement('button');
    var text = document.createTextNode('Merge old');
    button.appendChild(text)
    button.onclick = function () {
      try {
        if (merge_old_translation_text()) {
          console.log("merged");
        }
      } catch(err) {
        console.error(err.message);
      }
      return false;
    }
    long_el[0].parentNode.insertBefore(button, long_el.nextSibling);
  }
}

function add_button_merge_english()
{
  var long_el = document.getElementsByName('long');
  if (long_el[0]) {
    var button = document.createElement('button');
    var text = document.createTextNode('Merge English');
    button.appendChild(text)
    button.onclick = function () {
      try {
        if (merge_english_text()) {
          console.log("merged");
        }
      } catch(err) {
        console.error(err.message);
      }
      return false;
    }
    long_el[0].parentNode.insertBefore(button, long_el.nextSibling);
  }
}

function main()
{
  try {
    add_button_merge_old();
    add_button_merge_english();
  } catch(err) {
    console.error(err.message);
  }
}

main();
