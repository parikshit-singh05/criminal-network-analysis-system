#!/bin/bash

set -e

echo "Installing backend dependencies..."
cd /workspaces/${localWorkspaceFolderBasename}/backend
pip install --upgrade pip
pip install -r requirements.txt

echo "Installing frontend dependencies..."
cd /workspaces/${localWorkspaceFolderBasename}/frontend
npm install

echo "Setup complete."