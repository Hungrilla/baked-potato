#! /bin/sh

# Essentials variables for some highlighting.
COLOR_OFF='\033[0m';
RED='\033[0;31m';
GREEN='\033[0;32m';
YELLOW='\033[0;33m';
MAGENTA='\033[0;35m';
CYAN='\033[0;36m';

# Verifying codebase.
printf "\n\r${CYAN}Verifying source using JSHint & JSCS.${COLOR_OFF}\n\r";
grunt verify --verbose;
