#!/bin/bash

# ChronoPwn 9.0 - The Singularity Engine Setup Script
# This script will install all dependencies and set up the project components

# Exit on error
set -e

# Install system dependencies
echo "Installing system dependencies..."
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nodejs npm build-essential

# Install Rust via rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env

# Setup Python backend
echo "Setting up Python backend..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup React frontend
echo "Setting up React frontend..."
cd frontend
npm install
cd ..

# Build Rust C2 server
echo "Building Rust C2 server..."
cd c2_server
cargo build --release
cd ..

# Compile payloads
echo "Compiling payloads..."
gcc payloads/reverse_shell.c -o payloads/reverse_shell

echo ""
echo "========================================"
echo "ChronoPwn 9.0 setup completed successfully!"
echo "========================================"
echo ""
echo "To start the system:"
echo "1. Start the backend:"
echo "   cd backend && source ../venv/bin/activate && python app.py"
echo ""
echo "2. Start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "3. Start the C2 server:"
echo "   cd c2_server && cargo run --release"
echo ""
echo "4. Run quantum simulations:"
echo "   cd quantum && python simulator.py"