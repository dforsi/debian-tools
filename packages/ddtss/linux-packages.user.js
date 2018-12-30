// ==UserScript==
// @name        Helper for linux-* packages
// @include     https://ddtp2.debian.net/ddtss/index.cgi/*/translate/linux-*
// @version     1.0.8
// @grant       none
// ==/UserScript==

// Description templates are at https://anonscm.debian.org/cgit/kernel/linux.git/tree/debian/templates/

/**** Start of translations ****/

var translations = {
  /* Italian */
  "it": {
    "linux-headers": {
      "short": "file header per Linux @localversion@",
      "long": "Questo pacchetto fornisce i file header del kernel specifici per l'architettura per il kernel Linux @localversion@, generalmente usati per compilare moduli del kernel all'esterno dell'albero. Questi file verranno installati in /usr/src/linux-headers-@localversion@ e possono essere usati per compilare moduli che si caricano nel kernel fornito dal pacchetto linux-image-@localversion@.",
    },
    "linux-image": {
      "short": "Linux @upstreamversion@ per @class@",
      "long": "Il kernel Linux @upstreamversion@ e i moduli per l'uso su @longclass@.",

      // Source package: linux
      "4kc-malta":   {"class": "schede MIPS Malta"},
      "5kc-malta":   {"class": "schede MIPS Malta (64 bit)"},
      "686-pae":     {"class": "PC moderni", "longclass": "PC con uno o più processori con la gestione PAE"},
      "686":         {"class": "PC più vecchi", "longclass": "PC con uno o più processori senza la gestione PAE"},
      "amd64":       {"class": "PC a 64 bit", "longclass": "PC con processori AMD64, Intel 64 o VIA Nano"},
      "arm64":       {"class": "macchine ARMv8 a 64 bit"},
      "armmp-lpae":  {"class": "SoC compatibili multipiattaforma ARMv7 con gestione LPAE", "longclass": "kernel ARMv7 multipiattaforma con gestione LPAE. Vedere https://wiki.debian.org/DebianKernel/ARMMP per i dettagli sulle piattaforme gestite"},
      "armmp":       {"class": "SOC compatibili multipiattaforma ARMv7", "longclass": "kernel multipiattaforma ARMv7. Vedere https://wiki.debian.org/DebianKernel/ARMMP per i dettagli sulle piattaforme gestite"},
      "cloud-amd64": {"class": "cloud x86-64 (firmato)", "longclass": "piattaforme cloud Amazon EC2, Google Compute Engine e Microsoft Azure"},
      "loongson-3":  {"class": "Loongson 3A/3B", "longclass": "sistemi basati su Loongson 3A o 3B (es. da Loongson o Lemote)"},
      "marvell":     {"class": "Marvell Kirkwood/Orion", "longclass": "sistemi basati su Marvell Kirkwood e Orion (https://wiki.debian.org/ArmEabiPort#Supported_hardware)"},
      "octeon":      {"class": "Octeon", "longclass": "Cavium Networks Octeon"},
      "powerpc64le": {"class": "PowerPC Little endian a 64 bit"},
      "powerpc64":   {"class": "PowerPC a 64 bit"},
      "powerpc-smp": {"class": "PowerPC multiprocessore a 32 bit"},
      "powerpc":     {"class": "PowerPC monoprocessore a 32 bit"},
      "rt-686-pae":  {"class": "PC moderni, PREEMPT_RT", "longclass": "PC con uno o più processori con la gestione PAE"},
      "rt-amd64":    {"class": "PC a 64 bit, PREEMPT_RT", "longclass": "PC con processori AMD64, Intel 64 o VIA Nano"},
      "s390x":       {"class": "IBM zSeries"},
      "versatile":   {"class": "Versatile", "longclass": "sistemi Versatile (PB, AB, Qemu)"},
    },
    "linux-kbuild": {
      "short": "infrastruttura kbuild per Linux @upstreamversion@",
      "long": "Questo pacchetto fornisce l'infrastruttura kbuild per i pacchetti degli header per la versione @upstreamversion@ del kernel Linux.",
    },
    "linux-image-dbg" : {
      "short": "simboli di debug per linux-image-@localversion@",
      "long": "Questo pacchetto fornisce i simboli di debug separati per il kernel Linux e i moduli in linux-image-@localversion@.",
    }
  },
};

/**** End of translations ****/

// Get information from page URL
var pathnameParts = window.location.pathname.split('/');
var language = pathnameParts[3];
var packageFilename = pathnameParts[5];
var packageParts = packageFilename.split(/(.+?)-([0-9]+.[0-9]+)(.[0-9]+-[0-9]+)-(.+)/); // eg. linux-image-4.8.0-1-armmp-lpae ==> Array [ "", "linux-image", "4.8", ".0-1", "armmp-lpae", "" ]
var package = packageParts[1];
var upstreamVersion = packageParts[2];
var localVersion = packageParts[2] + packageParts[3] + '-' + packageParts[4];
var abiname = packageParts[4];
// Debug packages
var debug_suffix = "-dbg";
if (abiname.endsWith(debug_suffix)) {
  package += debug_suffix;
  localVersion = localVersion.replace(debug_suffix, "");
  abiname = abiname.substring(0, abiname.length - debug_suffix.length);
}
// Unsigned packages
var unsigned_suffix = "-unsigned";
if (abiname.endsWith(unsigned_suffix)) {
  abiname = abiname.replace(unsigned_suffix, "");
}
var strings = translations[language][package][abiname] || {};
var class_ = strings.class || "<trans>";
var longclass = strings.longclass || class_;

//console.log(pathnameParts);
//console.log(packageParts);
//console.log(language, package, upstreamVersion, localVersion);
//console.log("abiname:", abiname);

// Search translations and build translated descriptions

function replaceVariables(template) {
  return template
    .replace(/@abiname@/g, abiname)
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
// setTimeout is used because body onload will disable the button
var submit = document.getElementsByName("submit")
if (replaceIfNotTranslated('short', shortDescription)) {
  setTimeout(function(){ submit[0].disabled = false; }, 1000);
}
if (replaceIfNotTranslated('long', longDescription)) {
  setTimeout(function(){ submit[0].disabled = false; }, 1000);
}
