// ==UserScript==
// @name Canned strings for DDTSS
// @description Add prepared phrases for comments
// @version 0.2
// @match https://ddtp.debian.net/ddtss/index.cgi/*/translate/*
// @grant none
// ==/UserScript==
// Daniele Forsi 05/01/2016
// Creative Commons Zero

{
var nick = '';
var comment_strings = [
  "rich. per paragrafo mancante",
  "rich. per TYPO",
  "rich. per uniformare",
].sort();

// an empty string is used to start a new row of buttons
comment_strings.push("");

var element = document.getElementsByName("short");
// "1" means automatically translated
var newtitle = element[0] && element[0].value == "<trans>" ? "0" : "1";

var element = document.getElementsByName("long");
if (element[0]) {
  var re = /\n\.\n/g;
  // using slice() to remove trailing \n
  var parts = element[0].value.slice(0 , -1).split(re);
  var paragraphs = newtitle;
  for (var i = 0; i < parts.length; i++) {
    paragraphs += (parts[i] == "<trans>" ? "0" : "1");
  }

  console.log("paragraphs", paragraphs);
  var text = '';
  if (paragraphs.match(/^1+$/)) {
    text = "tutto AUTO";
  } else if (paragraphs.match(/^10+$/)) {
    text = "titolo AUTO";
  } else if (paragraphs.match(/^010*$/)) {
    text = "primo AUTO";
  } else if (paragraphs.match(/^00+1$/)) {
    text = "ultimo AUTO";
  } else if (paragraphs.match(/^01+$/)) {
    text = "solo titolo";
  } else if (paragraphs.match(/^101*$/)) {
    text = "solo primo";
  } else if (paragraphs.match(/^11+0$/)) {
    text = "solo ultimo";
  } else if (paragraphs.match(/^0+$/)) {
    text = "tutto NUOVO";
  }

  if (text) {
    comment_strings.push(text);
  } else {
    text = '';
    if (!newtitle) {
        text += ' titolo';
    }
    for (var i = 1; i < paragraphs.length; i++) {
      if (paragraphs[i] == "1") {
        text += ' ' + i;
      }
    }
    if (text) {
      comment_strings.push('automatici:' + text);
    }

    text = '';
    if (newtitle) {
        text += ' titolo';
    }
    for (var i = 1; i < paragraphs.length; i++) {
      if (paragraphs[i] == "0") {
        text += ' ' + i;
      }
    }
    if (text) {
      comment_strings.push('nuovi o aggiornati:' + text);
    }
  }

  // Add buttons near the comments box
  var comment_el = document.getElementsByName("comment");
  if (comment_el[0]) {
    var span_el = document.createElement("span");
    span_el.style = "display:inline-block;vertical-align:top";
    for (var i = 0; i < comment_strings.length; i++) {
      if (comment_strings[i] == "") {
        var br = document.createElement("br");
        span_el.appendChild(br);
      } else {
        var button = document.createElement("button");
        var text = document.createTextNode(comment_strings[i]);
        button.appendChild(text);
        button.onclick = function (element, nick, comment) {
          // prepend comment
          element.value = nick + comment + "\n\n" + element.value;
          return false;
        }.bind(this, comment_el[0], nick, comment_strings[i]);
        span_el.appendChild(button);
      }
    }
    comment_el[0].parentNode.insertBefore(span_el, comment_el.nextSibling);
  }
}
}
