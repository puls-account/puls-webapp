#!/bin/bash

# PULS Survey Deployment Script
echo "Starting deployment to puls-survey.com..."

# Build the application
echo "Building application..."
npm run build

# Create deployment package
echo "Creating deployment package..."
tar -czf puls-survey-deploy.tar.gz \
  .next \
  public \
  package.json \
  package-lock.json \
  ecosystem.config.js \
  --exclude=node_modules

echo "Deployment package created: puls-survey-deploy.tar.gz"
echo "Upload this file to your server and run:"
echo "1. tar -xzf puls-survey-deploy.tar.gz"
echo "2. npm install --production"
echo "3. pm2 start ecosystem.config.js"
echo "4. Configure nginx to proxy to port 3000"