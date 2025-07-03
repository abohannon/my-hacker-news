#!/bin/bash

# Install Google Cloud SDK on macOS

echo "Installing Google Cloud SDK..."

# Download the SDK
curl https://sdk.cloud.google.com | bash

# Restart shell to reload PATH
exec -l $SHELL

# Initialize gcloud
gcloud init