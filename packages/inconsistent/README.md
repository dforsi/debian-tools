# inconsistent

Tools to find inconsistencies in the descriptions of Debian packages, by Daniele Forsi, 2015

## Usage

```
Usage: ./inconsistent.py COMMAND ARGUMENT(S)
  --compare LANGUAGE1 LANGUAGE2  compares LANGUAGE1 and LANGUAGE2
  --suggest-short LANGUAGE PACKAGE  suggests a short description for PACKAGE in LANGUAGE
  --summary LANGUAGE...  prints stats about each specified LANGUAGE
  --update LANGUAGE      updates the database with the given LANGUAGE
```

### Import

First you need some data to import, for example

```
DIST=sid
for LNG in en it; do
 wget --timestamping http://ftp.debian.org/debian/dists/$DIST/main/i18n/Translation-$LNG.bz2
 bunzip2 Translation-$LNG.bz2
 ./inconsistent.py --update $LNG
done
```

SQL injection! Do not pass untrusted LANGUAGE arguments to this script.
The PACKAGE arguments are handled safely.

You can also import individual debian/control files or files that in a running Debian system are located in /var/lib/apt/lists/*Translation-* if you copy them in the current directory and rename them as Translation-$LNG.

### Get some stats about databases

Usage: ./inconsistent.py --summary LANGUAGE...
Do not use untrusted input for the LANGUAGE argument.

For a quick test of your databases, try this:

```
$ ./inconsistent.py --summary en
language	en
count	50507
not in en	0
titles	35362
trailers	5039
```

### Get suggestions

Usage: ./inconsistent.py --suggest-short LANGUAGE PACKAGE
Do not use untrusted input for the LANGUAGE argument.
The PACKAGE argument is passed to the LIKE operator which accepts the meta-characters '%' (for multiple characters) and '_' for a single character.

Example:
```
$ ./inconsistent.py --suggest-short it 0ad-data
0ad-data	gioco di strategia in tempo reale di guerra antica	file dati
0ad-data	gioco di strategia in tempo reale di guerra antica	file dei dati
0ad-data	gioco di strategia in tempo reale di guerra antica	file di dati
```

There are multiple suggestions because at this time the Italian translation for "(data files)" is inconsistent.

This isn't an automatic translation, it's a search for English packages that share the same title parts of the one you are interested in and then showing the existing translations, if any.

### List all suggestions

Usage: ./inconsistent.py --compare LANGUAGE1 LANGUAGE2

Do not use untrusted input for the LANGUAGE argument.

Example (the search for trailers can take up to a couple of minutes):

```
$ ./inconsistent.py --compare en it
$ ls -1 *.tsv
in-it-not-in-en.tsv
paragraphs-diff-it-en.tsv
suggest-title-it.tsv
suggest-trailer-it.tsv
```

This will create some TAB separated files containing the results of comparisons.

The file "in-it-not-in-en.tsv" contains a list of packages that are translated but do not have an English original (this can happen if some packages where dropped from Debian and the file with translated descriptions is older than the English descriptions).

The file "paragraphs-diff-it-en.tsv" contains a list of packages whose original descriptions have a different number of paragraphs than their translations.

The files "suggest-title-it.tsv" and "suggest-trailer-it.tsv" contain all suggestions that could be found for the first half and for the second half of the title.

# suggest-title

suggest-title.py is a script that given an input file in comma separated format, with package names in the first column, copies it to an output file appending a column with all suggestions that could be found for each packege (this can take tens of minutes).

## Bugs

The packages that were removed from Debian aren't removed from the databases by the --update command (only unused titles are deleted). Currently this is done to avoid loosing existing translations for packages under revision. To work around this bug you can periodically delete the databases (the English database canm be deleted each time).
