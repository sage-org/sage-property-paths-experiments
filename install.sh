#!/bin/bash

# creates a virtual environement to isolate project dependencies
virtualenv ppaths

# activates the virtual environement
source ppaths/bin/activate

# installs the main dependencies (for the scripts)
pip install -r requirements.txt

# installs the SaGe-Multi engine
git clone https://github.com/JulienDavat/sparql-engine.git clients/sage-multi-engine
cd clients/sage-multi-engine
git checkout property-paths
npm install
npm run build
cd ../..

# installs the SaGe-Multi smart client
cd clients/sage-multi
npm install
cd ../..

# installs the SaGe-PTC smart client
cd clients/sage-ptc
npm install
cd ../..

# installs the dependencies for the endpoint (Virtuoso/Fuseki) calling scripts
cd clients/endpoint
pip install -r requirements.txt
cd ../..

# installs the SaGe-PTC server
git clone https://github.com/JulienDavat/sage-engine.git servers/sage-ptc
cd servers/sage-ptc
git checkout extended-property-paths
pip install -r requirements.txt
pip install -e .[hdt]
cd ../..