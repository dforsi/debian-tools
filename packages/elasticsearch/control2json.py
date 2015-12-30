#!/usr/bin/env python3

# Daniele Forsi 20/12/2015 CC0

# Import the full content of a Translation-XX file
# in a local instance of Elasticsearch.
# This script expects an empty line at the end of the input
# so it doesn't work with a single debian/control file.

# Usage:
# ./control2json.py | curl -s -XPOST localhost:9200//debian/packages/_bulk --data-binary @/dev/stdin >/dev/null
# Quick check:
# curl -XGET 'localhost:9200/debian/packages/_count?pretty'

import json

filename = "Translation-it"

index = json.dumps({"index": {}})
with open(filename) as f:
    item = {"Long-Description": ""}
    for line in f.readlines():
        if line.startswith(" "):
            item["Long-Description"] += line[1:]
        elif line == "\n":
            print(index)
            print(json.dumps(item))
            item = {"Long-Description": ""}
        else:
            key, value = line.strip("\n").split(": ", 1)
            item[key] = value
