#!/usr/bin/env python
import MySQLdb
import argparse
import pycurl
import sys
import os


class downloader:

    TMP_PATH = "./tmp"
    BASE_URL = "https://cdn.eatoye.pk"
    USERAGENT = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:8.0) Gecko/20100101 Firefox/8.0"
    COOKIEFILE = TMP_PATH + "/cookie.txt"
    QUERY = "SELECT `img` FROM Restaurants"

    img_path = ""
    urls = []

    class color:
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
        self.img_path = img_path

        self.get_urls(host, user, passwd, db)
        self.create_dir(self.TMP_PATH)
        self.create_dir(self.img_path)

    def download_image(self, url, path):
        def progress(total_download, downloaded, total_upload, uploaded):
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
            curl.setopt(pycurl.URL, self.BASE_URL + url)
            curl.setopt(pycurl.USERAGENT, self.USERAGENT)
            curl.setopt(pycurl.COOKIEFILE, self.COOKIEFILE)
            curl.setopt(pycurl.COOKIEJAR, self.COOKIEFILE)
            curl.setopt(pycurl.WRITEDATA, file(path, "wb"))
            curl.setopt(pycurl.UPLOAD, 0)
            curl.setopt(pycurl.NOPROGRESS, 0)
            curl.setopt(pycurl.PROGRESSFUNCTION, progress)
            curl.perform()
            return True
        else:
            return False

    def create_dir(self, directory):
        if not os.path.exists(directory):
            print self.color.WARNING + "Directory %s not exists, creating." % directory + self.color.ENDC
            os.makedirs(directory)

    def get_urls(self, host, user, passwd, db):
        try:
            db = MySQLdb.connect(host=host, user=user, passwd=passwd, db=db)
            cursor = db.cursor()
            cursor.execute(self.QUERY)
            for row in cursor.fetchall():
                self.urls.append(row[0])
        except MySQLdb.OperationalError as (code, message):
            print self.color.FAIL + "Error connecting to Database: `%s`\nMessage: `%s`" % (db, message) + self.color.ENDC
            sys.exit(1)
        except MySQLdb.ProgrammingError as (code, message):
            print self.color.FAIL + "Error executing `%s`\nMessage: `%s`" % (self.QUERY, message) + self.color.ENDC
            sys.exit(1)

    def fetch(self):
        for url in self.urls:
            path = self.img_path + url.split("/")[len(url.split("/")) - 1]
            if self.download_image(url, path):
                print self.color.OKGREEN + " Success." + self.color.ENDC
            else:
                print self.color.FAIL + "Image already exists. (%s)" % path + self.color.ENDC

parser = argparse.ArgumentParser(description="Tiny scripts to read from database.")

parser.add_argument("--host", dest="host", default="localhost", help="Database host.")
parser.add_argument("--user", dest="user", default="root", help="Username of the provided database host.")
parser.add_argument("--passwd", dest="passwd", default="", help="Credentials for database.")
parser.add_argument("--db", dest="db", default="hungrilla_temp", help="Name of the schema.")
parser.add_argument("--path", dest="path", default="imgs/", help="Path to store downloaded images")
args = parser.parse_args()

_downloader = downloader(args.path, args.host, args.user, args.passwd, args.db)
_downloader.fetch()

sys.exit(0)
