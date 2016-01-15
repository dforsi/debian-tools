#!/usr/bin/env python3

# Daniele Forsi 12/01/2016 CC0

# Reads suggested titles from a CSV file created by inconsistent.py (suggest-en-it.tsv)
# and merges them with a CSV file created by ddtp-checker.py (outputfile.csv)

# Usage: ./suggest-title.py outputfile.csv suggest-en-it.tsv new_output.csv

import sys
import csv

if len(sys.argv) != 4:
    print("Usage: {0} BASE-CSV TRANSLATIONS-CSV OUTPUT-CSV".format(sys.argv[0]), file=sys.stderr)
    sys.exit(1)

base = sys.argv[1]
translations = sys.argv[2]
output = sys.argv[3]

index = {}
with open(translations, 'r') as trans_file, open(base, 'r') as base_file, open(output, 'w') as out_file:
    no_suggestions = ''
    for row in csv.reader(trans_file, delimiter='\t'):
        if row[2]:
            title = row[2]
        else:
            title = '<trans>'
        if row[4]:
            title += ' - ' + row[4]
        try:
            index[row[0]] = index[row[0]] + '\n' + title
        except KeyError:
            index[row[0]] = title
    index['NAME'] = 'TITLE'

    writer = csv.writer(out_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)

    for row in csv.reader(base_file, delimiter=','):
        try:
            title = index[row[0]]
        except KeyError:
            title = no_suggestions
        writer.writerow(row + [title])
