#! /usr/bin/env python3
"""
Print dependency information about Debian packages

Author: Daniele Forsi IU5HKX 2019/01/08
License: CC0
"""

import locale
import apt
import apt_pkg


def split_description(package):
    """ Divide the summary and the long description """

    description = package.versions[0]._translated_records.long_desc
    long_description = ""
    lines = description.split("\n")
    short_description = lines[0]
    for line in lines[1:]:
        if line.startswith(" ."):
            long_description += "\n"
        else:
            if line.startswith("  "):
                # Workaround for indented lines without bullets
                if package.name in ["aldo", "ax25-apps", "d-rats", "fccexam", "hamexam", "linpsk", "multimon"]:
                    long_description += "\n"
            long_description += line[1:] + "\n"

    return short_description, long_description


def print_package(cache, package, depth, long_title=True):
    """ Print information about a single package """

    depth_char = {0: "=", 1: "-", 2: "~"}
    try:
        package = cache[package.name]
    except KeyError: # "The cache has no package named 'kvasd-installer'
        return

    # Don't use description because it removes two leading spaces and so bulleted lists break the RST
    # Don't use raw_description because it's broken for translated packages
    short_description, long_description = split_description(package)

    if long_title:
        title = short_description + " (" + package.name + ")"
        short_description = ""
    else:
        title = package.name

    print()
    print(title)
    print(depth_char[depth] * len(title))
    if short_description:
        print(short_description)
        print()
    print(long_description)
    if package.versions[0].homepage:
        print(package.versions[0].homepage)
        print()


def get_dependencies(cache, package):
    """ Gather dependency data """

    dependencies = {"package": package, "dependencies": []}
    for rev_depends in package.rev_depends_list:
        dependencies["dependencies"].append(get_dependencies(cache, rev_depends.parent_pkg))

    depends_list = package.version_list[0].depends_list
    if "Recommends" in depends_list:
        for recommends in depends_list["Recommends"]:
            for recommend in recommends:
                dependencies["dependencies"].append(recommend.target_pkg)
    if "Suggests" in depends_list:
        for suggests in depends_list["Suggests"]:
            for suggest in suggests:
                dependencies["dependencies"].append(suggest.target_pkg)
    try:
        dependencies["dependencies"].sort(key=lambda dependency: dependency["package"].name)
    except TypeError: # 'apt_pkg.Package' object is not subscriptable
        pass
    try:
        dependencies["dependencies"].sort(key=lambda dependency: dependency.name)
    except AttributeError: # 'dict' object has no attribute 'name'
        pass

    return dependencies


def get_descriptions(cache, data, depth=0):
    """ Retrieve descriptions of packages """

    try:
        print_package(cache, data["package"], depth)
        for dependency in data["dependencies"]:
            get_descriptions(cache, dependency, depth + 1)
    except TypeError:
        print_package(cache, data, depth)


def main(package_name):
    """ Main """

    apt_pkg.init()
    cache = apt_pkg.Cache(None)
    dependencies = get_dependencies(cache, cache[package_name])
    cache = apt.Cache()
    print(".. title::", package_name)
    print(".. contents::")
    print(".. section-numbering::")
    get_descriptions(cache, dependencies)


if __name__ == '__main__':
    locale.setlocale(locale.LC_ALL, '')
    package_name = "hamradio-tasks"
    main(package_name)
