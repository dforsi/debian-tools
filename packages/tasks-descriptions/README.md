Tool to extract package descriptions
====================================

This script renders a that can be converted in

Dependency Installation
-----------------------

    apt install python3-apt python3-docutils

HTML Format
-----------

    ./dep2rst.py | rst2html5 >descriptions.html --report=none


ODT Format
----------

    ./dep2rst.py | rst2odt >descriptions.odt --report=none

PDF Format
----------

    ./dep2rst.py | rst2latex >descriptions.tex --report=none
    pdflatex descriptions.tex
    pdflatex descriptions.tex
Excute the pdflatex twice as per the message
    LaTeX Warning: Label(s) may have changed. Rerun to get cross-references right.

Known Issues
------------

The table of contents in the ODT format must be manually updated.

Some lines in the PDF format are bold.

The code isn't readable.


Tools available in Debian
=========================

The same information in different formats is available with tools available in Debian.


List of Reverse Dependencies
------------------------------------

    apt-cache rdepends hamradio-tasks


Graph of Reverse Dependencies
-----------------------------

    apt install debtree

    debtree --max-depth=0 --show-rdeps hamradio-tasks | dot -Tsvg -o r-graph.svg 

