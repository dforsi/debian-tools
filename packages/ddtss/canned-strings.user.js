// ==UserScript==
// @name Canned strings for DDTSS
// @description Add prepared phrases for comments
// @version 0.4.2
// @match https://ddtp.debian.org/ddtss/index.cgi/*/forreview/*
// @match https://ddtp.debian.org/ddtss/index.cgi/*/translate/*
// @grant none
// ==/UserScript==
// Daniele Forsi 15/11/2016
// Creative Commons Zero

{
var nick = '';
var comment_strings = [
  "rich. per paragrafo mancante",
  "rich. per TYPO",
  "rich. per uniformare",
].sort();
comment_strings.push("FITT. ");

// an empty string is used to start a new row of buttons
comment_strings.push("");

var previous_el = document.getElementsByTagName('h5');
var is_update = false;
for (var i = 0; i < previous_el.length; i++) {
  if (previous_el[i].textContent == 'Information about previous translation') {
    is_update = true;
    break;
  }
}

var element = document.getElementsByTagName('h3');
if (element[0] && element[0].innerHTML == 'Raw form:' && element[0].nextSibling) {
  // "0" means needs translation
  var title = element[0].nextSibling.textContent.match(/Description-[^:]+: (.*)/);
  var newtitle = title && title[1] == "<trans>" ? "0" : "1";

  var parts = element[0].nextSibling.textContent.split(/Description-[^:]+: (.*)\n/)[2].split(/\n(?:#.*| \.)\n/)
  parts.splice(-2);
  var paragraphs = newtitle;
  for (var i = 0; i < parts.length; i++) {
    paragraphs += (parts[i] == " <trans>" ? "0" : "1");
  }

  console.log("paragraphs", paragraphs);
  var text = '';
  if (paragraphs.match(/^1+$/)) {
    text = "tutto AUTO";
  } else if (paragraphs.match(/^10+$/)) {
    text = "titolo AUTO";
  } else if (paragraphs.match(/^010*$/)) {
    text = "primo AUTO";
  } else if (paragraphs.match(/^010+1$/)) {
    text = "primo e ultimo AUTO";
  } else if (paragraphs.match(/^00+1$/)) {
    text = "ultimo AUTO";
  } else if (paragraphs.match(/^01+$/)) {
    text = "solo titolo";
  } else if (paragraphs.match(/^01+0$/)) {
    text = "solo titolo e ultimo";
  } else if (paragraphs.match(/^101*$/)) {
    text = "solo primo";
  } else if (paragraphs.match(/^10+0$/)) {
    text = "solo primo e ultimo";
  } else if (paragraphs.match(/^11+0$/)) {
    text = "solo ultimo";
  } else if (paragraphs.match(/^0+$/)) {
    text = "tutto NUOVO";
  }

  if (text) {
    comment_strings.push((is_update ? 'AGG ' : 'NUOVO ') + text);
  } else {
    text = '';
    if (newtitle == "1") {
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
    if (newtitle == "0") {
        text += ' titolo';
    }
    for (var i = 1; i < paragraphs.length; i++) {
      if (paragraphs[i] == "0") {
        text += ' ' + i;
      }
    }
    if (text) {
      comment_strings.push((is_update ? 'AGG ' : 'NUOVO ') + text);
    }
  }

function add_paragraphs_info(comment_el, paragraphs, is_update) {
  if (comment_el[0]) {
    var text = 'Need (re)translation: ';
    for (var i = 0; i < paragraphs.length; i++) {
        text += i + (paragraphs[i] == '0' ? '* ' : ' ');
    }
    text += (is_update ? ' UPD' : ' NEW');
    var span_el = document.createElement("span");
    span_el.innerHTML = text + '<br/>';
    comment_el[0].parentNode.insertBefore(span_el, comment_el[0]);
  }
}

function add_buttons(comment_el, comment_strings, is_update) {
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
          var extra_newlines = (element.value != '' ? '\n\n' : '');
          // prepend comment
          element.value = nick + comment + extra_newlines + element.value;
          return false;
        }.bind(this, comment_el[0], nick, comment_strings[i]);
        span_el.appendChild(button);
      }
    }
    comment_el[0].parentNode.insertBefore(span_el, comment_el.nextSibling);
  }
}

  if (document.location.toString().match('http.+/(translate|forreview)/.+')) {
    // Add buttons near the comments box
    var target_el = document.getElementsByName("comment");
    add_buttons(target_el, comment_strings, is_update);
  }
  var target_el = document.getElementsByName("long");
  add_paragraphs_info(target_el, paragraphs, is_update);

}
}
