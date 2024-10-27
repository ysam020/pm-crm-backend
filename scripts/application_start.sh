#!/bin/bash
# Navigate to the application directory
cd /home/ec2-user/cicd/pm-cicd

# Add npm and node to path
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # Loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # Loads nvm bash_completion

# Set NODE_ENV to production
export NODE_ENV=production

# Retrieve environment variables (adjust parameter names as needed)
export ACCESS_KEY=$(aws ssm get-parameter --name "ACCESS_KEY" --query "Parameter.Value" --output text)
export SECRET_ACCESS_KEY=$(aws ssm get-parameter --name "SECRET_ACCESS_KEY" --query "Parameter.Value" --output text)
export JWT_SECRET=$(aws ssm get-parameter --name "JWT_SECRET" --query "Parameter.Value" --output text)
export EMAIL_FROM=$(aws ssm get-parameter --name "EMAIL_FROM" --query "Parameter.Value" --output text)
export OPENCAGE_API_KEY=$(aws ssm get-parameter --name "OPENCAGE_API_KEY" --query "Parameter.Value" --output text)
export DEV_MONGODB_URI=$(aws ssm get-parameter --name "DEV_MONGODB_URI" --query "Parameter.Value" --output text)
export PROD_MONGODB_URI=$(aws ssm get-parameter --name "PROD_MONGODB_URI" --query "Parameter.Value" --output text)


# Install node modules
npm install
npm install nodemon pm2 -g

# Start the Node.js app with PM2 in production mode
pm2 start ecosystem.config.json --env production
