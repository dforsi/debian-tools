#!/usr/bin/env python3

# Daniele Forsi 20/03/2016 CC0

# Import the full content of a Translation-XX file
# in a local instance of Elasticsearch.

# Usage:
# ./control2json.py Translation-it | curl -s -XPOST localhost:9200//debian/packages/_bulk --data-binary @/dev/stdin >/dev/null
# Quick check:
# curl -XGET 'localhost:9200/debian/packages/_count?pretty'

import sys
import json

filename = sys.argv[1]

def get_package(f):
    package = {}
    for line in f.readlines():
        if line == "\n":
            yield package
            package = {}
        elif line.startswith(" "):
            # join continuation lines inserting a newline
            # removing the leading space and the trailing newline
            package[key] += "\n" + line[1:].strip("\n")
        else:
            key, value = line.strip("\n").split(": ", 1)
            package[key] = value

with open(filename) as f:
    for package in get_package(f):
        print(json.dumps({"index": {"_id": package["Description-md5"]}}))
        del package["Description-md5"]
        print(json.dumps(package))
