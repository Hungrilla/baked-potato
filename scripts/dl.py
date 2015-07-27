#!/usr/bin/env python
import MySQLdb
import argparse
import pycurl
import sys
import os

"""
Script to download images from `eatoye` cdn.

It uses `MySQLdb` to connect with database & `pycurl` to actually download images from given url so its highly
recommended you execute `__pyinit.sh` script before executing this script. It'll download all dependencies which is required
by this script. Cheers!
"""


class downloader:

    """
    Encapsulates all functionality to download images from `eatoye` cdn.
    """

    __TMP_PATH = "./tmp"
    __BASE_URL = "https://cdn.eatoye.pk"
    __USERAGENT = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:8.0) Gecko/20100101 Firefox/8.0"
    __COOKIEFILE = __TMP_PATH + "/cookie.txt"
    __QUERY = "SELECT `img` FROM Restaurants"

    __img_path = ""
    __urls = []

    class color:

        """
        Class to contain all bash color codes that this script uses.
        Execpt that, this doesn't actually do anything.
        """

        HEADER = "\033[95m"
        OKBLUE = "\033[94m"
        OKGREEN = "\033[92m"
        WARNING = "\033[93m"
        WHITE = "\033[37m"
        FAIL = "\033[91m"
        ENDC = "\033[0m"
        BOLD = "\033[1m"
        UNDERLINE = "\033[4m"

    def __init__(self, img_path, host, user, passwd, db):
        """
        Instantiate an instance of `downloader` class.

        Parameters:
            img_path - Path where images will be saved after downloading.
            host - Database host, e.g. localhost.
            user - Database user.
            passwd - Database password.
            db - Name of database.
        """
        self.__img_path = img_path

        self.__get_urls(host, user, passwd, db)

        self.__create_dir(self.__TMP_PATH)
        self.__create_dir(self.__img_path)

    def __download_image(self, url, path):
        """
        Downloads images from a given url.

        Parameters:
            url - URL to download image from.
            path - Path where image will be saved once its downloaded.

        Returns:
            True if image is downloaded successfully else False in case if image is already downloaded.
        """
        def __progress(total_download, downloaded, total_upload, uploaded):
            """
            Minor callback to display progress on terminal screen.
            """
            bar_length = 20
            percent = (float(downloaded) / total_download) if total_download != 0 else 0
            hashes = '#' * int(round(percent * bar_length))
            spaces = ' ' * (bar_length - len(hashes))
            out = "\r{0}Progress: [{1}] {2}%{3}".format(self.color.WARNING, hashes + spaces, int(round(percent * 100)), self.color.ENDC)
            sys.stdout.write(out)
            sys.stdout.flush()

        if not os.path.exists(path):
            print self.color.WHITE + "Downloading `%s`:" % url + self.color.ENDC

            curl = pycurl.Curl()
            curl.setopt(pycurl.URL, self.__BASE_URL + url)
            curl.setopt(pycurl.USERAGENT, self.__USERAGENT)
            curl.setopt(pycurl.COOKIEFILE, self.__COOKIEFILE)
            curl.setopt(pycurl.COOKIEJAR, self.__COOKIEFILE)
            curl.setopt(pycurl.WRITEDATA, file(path, "wb"))
            curl.setopt(pycurl.UPLOAD, 0)
            curl.setopt(pycurl.NOPROGRESS, 0)
            curl.setopt(pycurl.PROGRESSFUNCTION, __progress)
            curl.perform()

            return True
        else:
            return False

    def __create_dir(self, directory):
        """
        Creates directory if it doesn't exist.

        Parameters:
            directory - Name of the directory.
        """
        if not os.path.exists(directory):
            print self.color.WARNING + "Directory %s not exists, creating." % directory + self.color.ENDC
            os.makedirs(directory)

    def __get_urls(self, host, user, passwd, db):
        """
        Fetch all image urls from database.

        Parameters:
            host - Database host.
            user - Database user.
            passwd - Database passwd.
            db - Database name.

        Raises:
            MySQLdb.OperationalError - In case if script fails to connect to MySQL database.
            MySQLdb.ProgrammingError - Raises when something wrong with the query.
        """
        try:
            db = MySQLdb.connect(host=host, user=user, passwd=passwd, db=db)
            cursor = db.cursor()
            cursor.execute(self.__QUERY)
            for row in cursor.fetchall():
                self.__urls.append(row[0])

        except MySQLdb.OperationalError as (code, message):
            print self.color.FAIL + "Error connecting to Database: `%s`\nMessage: `%s`" % (db, message) + self.color.ENDC
            sys.exit(1)

        except MySQLdb.ProgrammingError as (code, message):
            print self.color.FAIL + "Error executing `%s`\nMessage: `%s`" % (self.__QUERY, message) + self.color.ENDC
            sys.exit(1)

    def fetch(self):
        """
        Does the actual hardwork in order to download image.

        Iterates over all urls, and download image one by one.
        """
        for url in self.__urls:
            path = self.__img_path + url.split("/")[len(url.split("/")) - 1]

            if self.__download_image(url, path):
                print self.color.OKGREEN + " Success." + self.color.ENDC
            else:
                print self.color.FAIL + "Image already exists. (%s)" % path + self.color.ENDC

parser = argparse.ArgumentParser(description="Script to download images from `eatoye` cdn.")

parser.add_argument("--host", dest="host", default="localhost", help="Database host.")
parser.add_argument("--user", dest="user", default="root", help="Username of the provided database host.")
parser.add_argument("--passwd", dest="passwd", default="", help="Credentials for database.")
parser.add_argument("--db", dest="db", default="hungrilla_temp", help="Name of the schema.")
parser.add_argument("--path", dest="path", default="imgs/", help="Path to store downloaded images")
args = parser.parse_args()

_downloader = downloader(args.path, args.host, args.user, args.passwd, args.db)
_downloader.fetch()

sys.exit(0)
