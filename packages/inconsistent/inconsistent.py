#!/usr/bin/env python3

# Daniele Forsi 31/12/2015 CC0

# Analyses the descriptions of Debian packages and their translations.
#
# For the typical usage you need at least the English descriptions and
# one file of translations:
# ./inconsistent.py --update en # imports Translation-en into inconsistent-en.sqlite3
# ./inconsistent.py --update it # imports Translation-it into inconsistent-it.sqlite3
# ./inconsistent.py --summary en it
# If you import only one language, some commands still work (but then
# comparisons aren't meaningful) if you pass the same language twice,
# eg.:
# ./inconsistent.py --summary en en

import sys
import sqlite3
import re
import csv

database_fmt = 'inconsistent-{0}.sqlite3'
datafile_fmt = 'Translation-{0}'

def usage():
    print('Usage: {0} COMMAND ARGUMENT(S)'.format(sys.argv[0]))
    print('  --compare LANGUAGE1 LANGUAGE2  compares LANGUAGE1 and LANGUAGE2')
    print('  --suggest-short LANGUAGE PACKAGE  suggests a short description for PACKAGE in LANGUAGE')
    print('  --summary LANGUAGE1 LANGUAGE2  prints differences between LANGUAGE1 and LANGUAGE2')
    print('  --update LANGUAGE      updates the database with the given LANGUAGE')

def add_title(cursor, language, title):
    try:
        cursor.execute("INSERT INTO title_{0} (title) VALUES (?)".format(language), (title,))
        return cursor.lastrowid
    except sqlite3.IntegrityError:
        cursor.execute("SELECT id FROM title_{0} WHERE title = ?".format(language), (title,))
        return cursor.fetchone()[0]

def opt_update(language):
    database = database_fmt.format(language)
    datafile = datafile_fmt.format(language)

    conn = sqlite3.connect(database)
    cursor = conn.cursor()

    cursor.execute("CREATE TABLE IF NOT EXISTS packages_{0} (name STRING, paragraphs INTEGER, descmd5 STRING, title_id INTEGER, trailer_id INTEGER)".format(language))
    cursor.execute("CREATE TABLE IF NOT EXISTS title_{0} (id INTEGER PRIMARY KEY, title STRING)".format(language))
    cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_title_{0} ON title_{0} (title)".format(language))

    with open(datafile) as f:
        description ='Description-{0}'.format(language)
        for package in get_package(f):
            title = package[description].split('\n')[0]
            parts = re.split(" +\(([^(]+)\)$| +\[(.+)\]$|(?: --| - -| -|;) +(.+)$", title)
            parts = [x for x in parts if x]
            if len(parts) == 2:
                #print(parts[0], parts[1])
                trailer_id = add_title(cursor, language, parts[1])
            else:
                #print(parts[0])
                # an empty trailer is acceptable but and empty string would match
                # lots of unrelated packages slowing queries down to a crawl
                trailer_id = None
            title_id = add_title(cursor, language, parts[0])
            paragraphs = 1 + package[description].count('\n.\n')
            cursor.execute("INSERT INTO packages_{0} (name, paragraphs, descmd5, title_id, trailer_id) VALUES (?, ?, ?, ?, ?)".format(language), (package['Package'], paragraphs, package['Description-md5'], title_id, trailer_id))

    cursor.execute("CREATE INDEX IF NOT EXISTS idx_packages_{0} ON packages_{0} (descmd5)".format(language))
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_title_id_{0} ON packages_{0} (title_id)".format(language))
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_trailer_id_{0} ON packages_{0} (trailer_id)".format(language))

    cursor.execute("ANALYZE")
    cursor.close()

    conn.commit()
    conn.close()

def compare_string(cursor, field, language1, language2):
    cursor.execute("""
SELECT p0.name, Count(*) AS count, t.title
 FROM packages_{0} AS p0
 INNER JOIN packages_{0} AS p1 ON p1.{2}_id = p0.{2}_id
 INNER JOIN packages_{1} AS p2 ON p2.descmd5 = p1.descmd5
 INNER JOIN title_{1} AS t ON t.id = p2.{2}_id
 WHERE p0.rowid <> p1.rowid AND p0.descmd5 not IN (
  SELECT descmd5 FROM packages_{1}
 )
GROUP BY p0.name, t.title
ORDER BY p0.name, count DESC, t.title
""".format(language1, language2, field))
    for row in cursor:
        yield row

def opt_compare(language1, language2):
    database1 = database_fmt.format(language1)
    database2 = database_fmt.format(language2)

    conn = sqlite3.connect(database1)
    cursor = conn.cursor()
    cursor.execute("ATTACH DATABASE '{0}' AS db2".format(database2))

    cursor.execute("SELECT name FROM packages_{0} WHERE descmd5 NOT IN (SELECT descmd5 FROM packages_{1}) ORDER BY name".format(language2, language1))
    with open('in-{0}-not-in-{1}.tsv'.format(language2, language1), 'w') as f:
        print('in {0} not in {1}'.format(language2, language1), file=f)
        for row in cursor:
            print(row[0], file=f)

    cursor.execute("SELECT t1.name, t1.paragraphs, t2.paragraphs FROM packages_{0} AS t1 INNER JOIN packages_{1} AS t2 ON t1.descmd5 = t2.descmd5 WHERE t1.paragraphs <> t2.paragraphs ORDER BY t1.name".format(language1, language2))
    with open('paragraphs-diff-{}-{}.tsv'.format(language2, language1), 'w') as f:
        print('paragraphs diff {}-{}\tpackage'.format(language1, language2), file=f)
        for row in cursor:
            print("{:>3}\t{}".format(row[1] - row[2], row[0]), file=f)

    for field in ['title', 'trailer']:
        with open('suggest-{2}-{0}.tsv'.format(language2, language1, field), 'w') as f:
            writer = csv.writer(f, delimiter='\t', quotechar='"', quoting=csv.QUOTE_MINIMAL)
            writer.writerow(('package', 'count', field))
            for row in compare_string(cursor, field, language1, language2):
                writer.writerow(row)

    cursor.close()
    conn.close()

def suggest_string(cursor, package, language1, language2):
    cursor.execute("""
SELECT DISTINCT p0.name, ti.title, tr.title AS trailer
 FROM packages_{0} AS p0
 LEFT JOIN packages_{0} AS p1 ON p1.title_id = p0.title_id AND p1.rowid <> p0.rowid
 LEFT JOIN packages_{0} AS p2 ON p2.trailer_id = p0.trailer_id AND p2.rowid <> p0.rowid
 INNER JOIN packages_{1} AS p3 ON p3.descmd5 = p1.descmd5
 INNER JOIN packages_{1} AS p4 ON p4.descmd5 = p2.descmd5
 LEFT JOIN title_{1} AS ti ON ti.id = p3.title_id
 LEFT JOIN title_{1} AS tr ON tr.id = p4.trailer_id
 WHERE NOT (p3.title_id IS NULL AND p4.trailer_id IS NULL) AND p0.name LIKE ?
 ORDER BY p0.name, ti.title, tr.title
""".format(language1, language2), (package, ))

def suggest_short(package, language1, language2):
    database1 = database_fmt.format(language1)
    database2 = database_fmt.format(language2)

    conn = sqlite3.connect(database1)
    cursor = conn.cursor()
    cursor.execute("ATTACH DATABASE '{0}' AS db2".format(database2))

    suggest_string(cursor, package, language1, language2)
    for row in cursor:
        yield row

    cursor.close()
    conn.close()

def opt_suggest_short(package, language1, language2):
    writer = csv.writer(sys.stdout, delimiter='\t', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for row in suggest_short(package, language1, language2):
        writer.writerow(row)

def opt_summary(language1, language2):
    database1 = database_fmt.format(language1)
    database2 = database_fmt.format(language2)

    conn = sqlite3.connect(database1)
    cursor = conn.cursor()
    cursor.execute("ATTACH DATABASE '{0}' AS db2".format(database2))

    summary = [['what', language1, language2]]

    # count all packages
    results = ['count']
    for language in (language1, language2):
        cursor.execute("SELECT Count(*) FROM packages_{0}".format(language))
        results.append(cursor.fetchall()[0][0])
    summary.append(results)

    # count missing packages
    cursor.execute("SELECT Count(*) FROM packages_{0} WHERE descmd5 NOT IN (SELECT descmd5 FROM packages_{1})".format(language2, language1))
    summary.append(['not in {1}'.format(language2, language1), 0, cursor.fetchall()[0][0]])
    cursor.execute("SELECT Count(*) FROM packages_{0} WHERE descmd5 NOT IN (SELECT descmd5 FROM packages_{1})".format(language1, language2))
    summary.append(['not in {1}'.format(language1, language2), cursor.fetchall()[0][0], 0])

    # count distinct titles
    results = ['titles']
    for language in (language1, language2):
        cursor.execute("SELECT Count(DISTINCT title_id) FROM packages_{0}".format(language))
        results.append(cursor.fetchall()[0][0])
    summary.append(results)

    # count distinct trailers
    results = ['trailers']
    for language in (language1, language2):
        cursor.execute("SELECT Count(DISTINCT trailer_id) FROM packages_{0}".format(language))
        results.append(cursor.fetchall()[0][0])
    summary.append(results)

    for row in summary:
        print("\t".join(str(x) for x in row))

    cursor.close()
    conn.close()

def get_package(f):
    package = {}
    for line in f.readlines():
        if line.startswith(" "):
            # concatenate all continuation lines
            package[key] += "\n" + line[1:].strip("\n")
        elif line == "\n":
            yield package
            package = {}
        else:
            key, value = line.strip("\n").split(": ", 1)
            package[key] = value
    # debian/control files do not end with an empty line
    if line != "\n":
        yield package

def main():
    if len(sys.argv) == 4 and sys.argv[1] == '--compare':
        language1 = sys.argv[2]
        language2 = sys.argv[3]
        opt_compare(language1, language2)
    elif len(sys.argv) == 4 and sys.argv[1] == '--suggest-short':
        language1 = 'en'
        language2 = sys.argv[2]
        package = sys.argv[3]
        opt_suggest_short(package, language1, language2)
    elif len(sys.argv) == 4 and sys.argv[1] == '--summary':
        language1 = sys.argv[2]
        language2 = sys.argv[3]
        opt_summary(language1, language2)
    elif len(sys.argv) == 3 and sys.argv[1] == '--update':
        language = sys.argv[2]
        opt_update(language)
    else:
        usage()
        sys.exit(1)

if __name__ == '__main__':
    main()
