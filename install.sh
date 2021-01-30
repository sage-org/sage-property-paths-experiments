#!/bin/bash

# creates a virtual environement to isolate project dependencies
virtualenv --python=/usr/bin/python3 ppaths

# activates the virtual environement
source ppaths/bin/activate

# installs the main dependencies (for the scripts)
pip install -r requirements.txt

# install submodules
git submodule update --init

# installs the SaGe-Multi engine
cd clients/sage-multi-engine
echo "entering in the directory $(pwd)"
# git checkout property-paths
npm install
npm run build
echo "exiting in the directory $(pwd)"
cd ../..
echo "back in the directory $(pwd)"

# installs the SaGe-Multi smart client
cd clients/sage-multi
echo "entering in the directory $(pwd)"
npm install
echo "exiting in the directory $(pwd)"
cd ../..
echo "back in the directory $(pwd)"

# installs the SaGe-PTC smart client
cd clients/sage-ptc
echo "entering in the directory $(pwd)"
npm install
echo "exiting in the directory $(pwd)"
cd ../..
echo "back in the directory $(pwd)"

# installs the dependencies for the endpoint (Virtuoso/Fuseki) calling scripts
cd clients/endpoints
echo "entering in the directory $(pwd)"
pip install -r requirements.txt
echo "exiting in the directory $(pwd)"
cd ../..
echo "back in the directory $(pwd)"

# installs the SaGe-PTC server
cd servers/sage-ptc
echo "entering in the directory $(pwd)"
# git checkout extended-property-paths
pip install -r requirements.txt
pip install -e .[hdt]
echo "exiting in the directory $(pwd)"
cd ../..
echo "back in the directory $(pwd)"