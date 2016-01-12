#!/usr/bin/env python3

# Daniele Forsi 04/01/2016 CC0

# Suggests titles for untranslated packages

# Typical usage:
# ./suggest-title.py it input.csv output.csv

import sys
import csv
import inconsistent

if len(sys.argv) != 4:
    print("Usage: {0} LANGUAGE INPUT-CSV OUTPUT-CSV".format(sys.argv[0]), file=sys.stderr)
    sys.exit(1)

language1 = 'en'
language2 = sys.argv[1]
input = sys.argv[2]
output = sys.argv[3]

with open(input, 'r') as infile, open(output, 'w') as outfile:
    reader = csv.reader(infile)
    writer = csv.writer(outfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    title_column = None
    for row in reader:
        if title_column == None:
            if 'TITLE' not in row:
                row.append('TITLE')
            title_column = row.index('TITLE')
            writer.writerow(row)
            continue
        package = row[0]
        title = []
        if row[0] != 'Translated':
            for sugg in inconsistent.suggest_short(package, language1, language2):
                if sugg[1]:
                    if sugg[2]:
                        title.append(sugg[1] + ' -- ' + sugg[2])
                    else:
                        title.append(sugg[1])
                else:
                    if sugg[2]:
                        title.append('<trans>' + ' -- ' + sugg[2])
        try:
            row[title_column] = '\n'.join(title)
        except IndexError:
            row.append('\n'.join(title))
        writer.writerow(row)
