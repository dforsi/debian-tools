// ==UserScript==
// @name        Helper for linux-* packages
// @include     https://ddtp2.debian.net/ddtss/index.cgi/*/translate/linux-*
// @version     1.0
// @grant       none
// ==/UserScript==

// Description templates are at https://anonscm.debian.org/cgit/kernel/linux.git/tree/debian/templates/
//
// For linux-image-* packages see control.image.in:
// Linux @upstreamversion@ for @class@
// The Linux kernel @upstreamversion@ and modules for use on @longclass@.

/**** Start of translations ****/

var translations = {
  /* Italian */
  "it": {
    "linux-image": {
      "short": "Linux @upstreamversion@ per @class@",
      "signed": " (firmato)",
      "long": "Il kernel Linux @upstreamversion@ e i moduli per l'uso su @longclass@.",

      // Source package: linux
      "4kc-malta":            {"class": "schede MIPS Malta"},
      "5kc-malta":            {"class": "schede MIPS Malta (64 bit)"},
      "686-pae-unsigned":     {"class": "PC moderni", "longclass": "PC con uno o più processori con la gestione PAE"},
      "686-unsigned":         {"class": "PC più vecchi", "longclass": "PC con uno o più processori senza la gestione PAE"},
      "amd64-unsigned":       {"class": "PC a 64 bit", "longclass": "PC con processori AMD64, Intel 64 o VIA Nano"},
      "arm64-unsigned":       {"class": "macchine ARMv8 a 64 bit"},
      "armmp-lpae-unsigned":  {"class": "SoC compatibili multipiattaforma ARMv7 con gestione LPAE", "longclass": "kernel ARMv7 multipiattaforma con gestione LPAE. Vedere https://wiki.debian.org/DebianKernel/ARMMP per i dettagli sulle piattaforme gestite."},
      "armmp-unsigned":       {"class": "SOC compatibili multipiattaforma ARMv7", "longclass": "kernel multipiattaforma ARMv7. Vedere https://wiki.debian.org/DebianKernel/ARMMP per i dettagli sulle piattaforme gestite."},
      "loongson-3":           {"class": "Loongson 3A/3B", "longclass": "sistemi basati su Loongson 3A o 3B (es. da Loongson o Lemote)"},
      "marvell":              {"class": "Marvell Kirkwood/Orion", "longclass": "sistemi basati su Marvell Kirkwood (SheevaPlug, QNAP TS-119/TS-219, ecc.) e sistemi basati su Orion 5181, 5182 e 5281 (QNAP TS-109/TS-209, ecc.)"},
      "octeon":               {"class": "Octeon", "longclass": "Cavium Networks Octeon"},
      "powerpc64le-unsigned": {"class": "PowerPC Little endian a 64 bit"},
      "powerpc64-unsigned":   {"class": "PowerPC a 64 bit"},
      "powerpc-smp-unsigned": {"class": "PowerPC multiprocessore a 32 bit"},
      "powerpc-unsigned":     {"class": "PowerPC monoprocessore a 32 bit"},
      "rt-686-pae-unsigned":  {"class": "PC moderni, PREEMPT_RT", "longclass": "PC con uno o più processori con la gestione PAE"},
      "rt-amd64-unsigned":    {"class": "PC a 64 bit, PREEMPT_RT", "longclass": "PC con processori AMD64, Intel 64 o VIA Nano"},
      "s390x-unsigned":       {"class": "IBM zSeries"},
      "versatile":            {"class": "Versatile", "longclass": "sistemi Versatile (PB, AB, Qemu)"},

      // Source package: linux-signed (will fallback to descriptions for unsigned packages)
      "686":                  {"signed": true},
      "686-pae":              {"signed": true},
      "amd64":                {"signed": true},
      "arm64":                {"signed": true},
      "powerpc64le":          {"signed": true},
      "rt-686-pae":           {"signed": true},
      "rt-amd64":             {"signed": true},
    },
  },
};

/**** End of translations ****/

// Get information from page URL
var pathnameParts = window.location.pathname.split('/');
var language = pathnameParts[3];
var packageFilename = pathnameParts[5];
var packageParts = packageFilename.split(/([^-]+-[^-]+)-([0-9]+\.[0-9]+)([^-]+-[^-]+)-(.*)/); // eg. linux-image-4.8.0-1-armmp-lpae-unsigned
var package = packageParts[1];
var upstreamVersion = packageParts[2];
var abiname = packageParts[4];

//console.log(pathnameParts);
//console.log(packageParts);
//console.log(language, package, upstreamVersion);
//console.log("abiname:", abiname);

// Search translations and build translated descriptions
if (!translations[language][package][abiname]) {
  abiname += '-unsigned';
  if (!translations[language][package][abiname]) {
    translations[language][package][abiname] = {"class": "<trans>"};
  }
}
var class_ = translations[language][package][abiname].class;
var longclass = translations[language][package][abiname].longclass || class_;
var signed = translations[language][package][abiname].signed;
if (signed) {
  class_ += translations[language][package].signed;
}

function replaceVariables(template) {
  return template
    .replace(/@abiname@/g, '') // FIXME: replacing with the actual value of abiname breaks linux-headers
    .replace(/@class@/g, class_)
    .replace(/@localversion@/g, localVersion)
    .replace(/@longclass@/g, longclass)
    .replace(/@upstreamversion@/g, upstreamVersion);
}

var shortDescription = replaceVariables(translations[language][package].short);
var longDescription = replaceVariables(translations[language][package].long);
console.log(shortDescription);
console.log(longDescription);

/* Returns true if value was replaced */
function replaceIfNotTranslated(elementName, translation) {
  var element = document.getElementsByName(elementName);
  var oldValue = element[0].value;
  element[0].value = oldValue.replace(/<trans>/, translation);

  return oldValue != element[0].value;
}

// Replace text if needed and enable submit button only if text was changed
// setTimeout is used because body onload wiil disable the button
var submit = document.getElementsByName("submit")
if (replaceIfNotTranslated('short', shortDescription)) {
  setTimeout(function(){ submit[0].disabled = false; }, 1000);
}
if (replaceIfNotTranslated('long', longDescription)) {
  setTimeout(function(){ submit[0].disabled = false; }, 1000);
}
