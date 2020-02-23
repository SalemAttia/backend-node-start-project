#!/bin/bash

echo "Copying /var/code/settings/config-example.js to /var/code/settings/config.js"
cp /var/code/settings/config-example.js /var/code/settings/config.js

echo "Removing node_modules"
rm -r node_modules

echo "Installing dependencies"
npm install

echo "Startup commands are completed successfully"
bash
