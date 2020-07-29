// ==UserScript==
// @name        New layout for DDTSS
// @namespace   Violentmonkey Scripts
// @match       https://ddtp.debian.org/ddtss/index.cgi/it
// @grant       GM_addStyle
// @version     1.1
// @author      Daniele Forsi <dforsi@gmail.com>
// @description Testing a different layout for the main page.
// @require     https://code.jquery.com/jquery-3.5.1.slim.min.js
// @require     https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js
// @require     https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js
// ==/UserScript==
// Date 28/7/2020, 13:33:21

function addStyle(style) {
  var head = document.getElementsByTagName('head')[0];
  var element = head.appendChild(window.document.createElement('style'));
  element.innerHTML = style;
}

function addStyles() {
  addStyle('body{margin:0.5em !important}');
  addStyle('a:visited{color:green}');
  addStyle('li:nth-of-type(odd),.nav li:not(active),footer{background-color:rgba(0,0,0,.05)}');
  addStyle('.nav a{color:initial}');
  addStyle('input[type=checkbox]{margin:0.5em}');
  addStyle('@import "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css";');
}

function extractHelpText(selector) {
  try {
    let elements = document.querySelectorAll(selector);
    for (var i = 0; i < elements.length; i++) {
      let element = elements[i];
      let parentNode = element.parentNode;
      let helpText = document.createElement("div");
      
      helpText.classList.add("text-muted");
      helpText.innerText = element.title;
      element.remove();
      parentNode.insertAdjacentElement('afterend', helpText);
    }
  } catch (e) {
    console.error(e);
  }
}

function createBadge(element) {
  try {
    let parts = element.innerText.split(/([^(]+) \(([0-9]+)\)/);
    if (parts.length === 4) {
      // ignore parts[3] because it's empty or it contains only a colon
      return `${parts[0]} ${parts[1]} <span class="badge badge-pill badge-primary">${parts[2]}</span>`;
    } else {
      return element.innerText;
    }
  } catch (e) {
    console.error(e);
  }
}

function createBadgesByTagName(name) {
  try {
    let elements = document.getElementsByTagName(name);
    for (var i = 0; i < elements.length; i++) {
      let element = elements[i];
      element.innerHTML = createBadge(element);
    }
  } catch (e) {
    console.error(e);
  }
}

function getTitleByClassName(name) {
  let elements = document.getElementsByClassName(name);
  // messages have h3 while other blocks have h2, but it's always the first child
  let h = elements[0].children;

  return h[0];
}

function createTabsNav(classes) {
  var j;

  let nav = [];
  var active = " active";
  var ariaSelected = "true";
  for (j = 0; j < classes.length; j++) {
    let name = classes[j];
    let title = getTitleByClassName(name).cloneNode(true);
    nav += `<li class="nav-item"><a class="nav-link${active}" id="${name}-tab" data-toggle="tab" href="#${name}" role="tab" aria-controls="${name}" aria-selected="${ariaSelected}">${title.innerHTML}</a>`;
    active = "";
    ariaSelected = "false";
  }
  nav = '<ul class="nav nav-tabs flex-column flex-sm-row" id="mainTab" role="tablist">' + nav + '</ul>';

  return nav;
}

function createTabsDiv(classes) {
  let div = [];
  var active = " active";
  for (var j = 0; j < classes.length; j++) {
    let name = classes[j];
    let contents = document.getElementsByClassName(name);
    for (var i = 0; i < contents.length; i++) {
      let copy = contents[i];
      let help = copy.getElementsByClassName("help");
      let helpText = help.length > 0 ? '<div class="text-muted">' + help[0].title + '</div>' : '';
      // Remove contents from the initial position
      contents[i].parentNode.removeChild(contents[i]);
      // Remove title from the page (it has been copied in the tab)
      copy.children[0].parentNode.removeChild(copy.children[0]);
      div += `<div class="tab-pane${active}" id="${name}" role="tabpanel" aria-labelledby="${name}-tab">${helpText}${copy.innerHTML}</div>`;
    }
    active = "";
  }
  div = '<div class="tab-content">' + div + '</div>';

  return div;
}

function createTabs(after, classes) {
  try {
    // Create navs before divs
    let nav = createTabsNav(classes);
    let div = createTabsDiv(classes);
    let element = document.createElement("div");

    element.innerHTML = nav + div;
    after.insertAdjacentElement("afterend", element);
  } catch (e) {
    console.error(e);
  }
}

function moveForm() {
  try {
    let fetchForm = document.getElementsByTagName('form');
    let heading = fetchForm[0].previousElementSibling.previousElementSibling;
    let helpText = fetchForm[0].previousElementSibling;
    let untranslated = document.getElementById("untranslated");
    untranslated.append(heading);
    untranslated.append(helpText);
    untranslated.append(fetchForm[0]);
  } catch (e) {
    console.error(e);
  }
}

function moveFooter() {
  try {
    let footer = document.createElement("footer");
    let messages = document.getElementsByClassName('messages');
    footer.append(messages[0].children[5]); // Refresh
    footer.append(" :: ");
    footer.append(messages[0].children[5]); // Another language
    footer.append(" :: ");
    footer.append(messages[0].children[5]); // Wordlist
    footer.append(" :: ");
    footer.append(messages[0].children[5]); // DDTP documentation
    footer.append(" :: ");
    footer.append(messages[0].childNodes[9]); // Logged in as
    footer.classList = ["text-muted"];
    document.body.append(footer);
  } catch (e) {
    console.error(e);
  }
}

function moveMessages() {
  try {
    let messages = document.getElementsByClassName('messages');
    messages[0].append(messages[1]);
  } catch (e) {
    console.error(e);
  }
}

function reorderForreview() {
  try {
    let forreview = document.querySelectorAll("#forreview li");
    var reviewCount = 0;
    var child;
    let lists = document.createElement('div');
    lists.classList = ["clearfix"];

    lists.append(document.createElement('div'));
    lists.children[0].append("Need initial review");
    lists.children[0].append(document.createElement('ol'));
    lists.children[0].classList = "float-left pr-3";
    lists.children[0].children[0].classList = "list-unstyled";

    lists.append(document.createElement('div'));
    lists.children[1].append("Need review, had 1");
    lists.children[1].append(document.createElement('ol'));
    lists.children[1].classList = "float-left pr-3";
    lists.children[1].children[0].classList = "list-unstyled";

    lists.append(document.createElement('div'));
    lists.children[2].append("Need review, had 2");
    lists.children[2].append(document.createElement('ol'));
    lists.children[2].classList = "float-left pr-3";
    lists.children[2].children[0].classList = "list-unstyled";

    for (var i = 0; i < forreview.length; i++) {
      let text = forreview[i].innerText;
      switch (text.slice(-2)) {
        case "w)": child = 0; break; // (needs initial review)
        case "1)": child = 1; break; // (needs review, had 1)
        default: child = 2; // all the rest
      }
      let li = document.createElement('li');
      li.append(forreview[i].children[0]);
      lists.children[child].children[0].append(li);
    }

    var badge = document.createElement('span');
    badge.classList = "badge badge-pill badge-primary float-right";

    let badges = [badge.cloneNode(), badge.cloneNode(), badge.cloneNode()];

    badges[0].innerText = lists.children[0].children[0].children.length;
    lists.children[0].insertBefore(badges[0], lists.children[0].children[0]);
    badges[1].innerText = lists.children[1].children[0].children.length;
    lists.children[1].insertBefore(badges[1], lists.children[1].children[0]);
    badges[2].innerText = lists.children[2].children[0].children.length;
    lists.children[2].insertBefore(badges[2], lists.children[2].children[0]);
    
    let oldlist = document.getElementById('forreview');
    oldlist.children[1].remove();
    oldlist.append(lists);
  } catch (e) {
    console.error(e);
  }
}

function main() {
  extractHelpText(".help");
  createBadgesByTagName("h2");
  createBadgesByTagName("h3");
  let header = document.getElementsByTagName('h1');
  createTabs(header[0], [/*"messages", */"untranslated", "forreview", "reviewed", "translated", "infobox", "messages"]);
  moveForm();
  moveFooter();
  moveMessages();
  reorderForreview();
  addStyles();
}

main();
