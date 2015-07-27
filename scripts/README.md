### `./test.sh`

Tiny shell script to verify if code contains any `JSHint` or `JSCS` errors.

This script also supposed to execute unit tests if we get time to write them, someday!

### `./dl.py`

Script to download images from `eatoye` cdn.

It uses `MySQLdb` to connect with database & `pycurl` to actually download images from given url so its highly
recommended you execute `__pyinit.sh` script before executing this script. It'll download all dependencies which is required
by this script. Cheers!

**Requirements:**
 - `Python 2.7.x`.
 - `easy_install`.
 - Internet & a lot of popcorn.

**How to:**
 - After taking latest execute following commands:
``` bash
$ cd scripts/
$ chmod +x __pyinit.sh
$ chmod +x dl.py
```
This will make both scripts executable.
- Now first you need to run `__pyinit.sh`. You can do it by:
``` bash
$ ./__pyinit.sh
```
This will install all dependencies that are required by `dl.py`.

- Execute downloader script by:
``` bash
$ ./dl.py
```

**Usage:**
``` bash 
$ ./dl.py -h
usage: dl.py [-h] [--host HOST] [--user USER] [--passwd PASSWD] [--db DB]
             [--path PATH]

Script to download images from `eatoye` cdn.

optional arguments:
  -h, --help       show this help message and exit
  --host HOST      Database host.
  --user USER      Username of the provided database host.
  --passwd PASSWD  Credentials for database.
  --db DB          Name of the schema.
  --path PATH      Path to store downloaded images
```

**Screenshot:**
![Screenshot](http://i.imgur.com/oXEGi9y.png)
