#! /bin/bash

function check_easy_install {
	# checks if `easy_install` is installed.
	# while running on an osx you don't have to worry about this.
	# it comes pre-installed with osx. ;D
	command -v easy_install >/dev/null 2>&1 || { echo >&2 "easy_install is required but it's not installed.  Aborting."; exit 1; }
}

function check_if_sudo {
	# because this script installs python dependencies
	# therefore, it should be executed with sudo.
	if [ "$EUID" -ne 0 ]; then 
		echo "Please run this script as root";
  		exit 1;
	fi
}

function install_pip {
	# installs pip - package manager for python.
	sudo easy_install pip
}

function install_packages {
	# installs dependencies
	sudo -H pip install MySQL-python;
	sudo -H pip install pycurl;
}

check_if_sudo;
check_easy_install;
install_pip;
install_packages;	
exit 0;