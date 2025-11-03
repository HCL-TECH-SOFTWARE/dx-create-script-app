#!/bin/bash
# /* ======================================================================== *
#  * Copyright 2025 HCL America Inc.                                          *
#  * Licensed under the Apache License, Version 2.0 (the "License");          *
#  * you may not use this file except in compliance with the License.         *
#  * You may obtain a copy of the License at                                  *
#  *                                                                          *
#  * http://www.apache.org/licenses/LICENSE-2.0                               *
#  *                                                                          *
#  * Unless required by applicable law or agreed to in writing, software      *
#  * distributed under the License is distributed on an "AS IS" BASIS,        *
#  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
#  * See the License for the specific language governing permissions and      *
#  * limitations under the License.                                           *
#  * ======================================================================== */
# ========================================================================
# End-to-End Test Script for create-dx-script-app
# 
# This script can be used by both Jenkins and GitHub Actions to run
# end-to-end tests for the create-dx-script-app CLI.
# ========================================================================

set -e  # Exit immediately if a command exits with a non-zero status
# Ensure DX_HOSTNAME is set, fallback to HOSTNAME if not
DX_HOSTNAME=${DX_HOSTNAME:-$HOSTNAME}

# Set default values for parameters if not provided via environment variables
APP_NAME=${APP_NAME:-"e2e-test-app"}
TEMPLATE=${TEMPLATE:-"react-js"}
HOSTNAME=${HOSTNAME:-"localhost"}
DX_PORT=${DX_PORT:-"10039"}
TEST_DX_DEPLOY=${TEST_DX_DEPLOY:-"false"}

echo "=== 📋 End-to-End Test Configuration ==="
echo "App Name: $APP_NAME"
echo "Template: $TEMPLATE"
echo "Hostname: $HOSTNAME"
echo "DX Port: $DX_PORT"
echo "Test DX Deploy: $TEST_DX_DEPLOY"
echo "=======================================\n"

echo "=== 🧹 Cleaning up previous test runs ==="
rm -rf "$APP_NAME"
echo "✅ Cleanup complete"

echo "\n=== 🛠️ Installing dependencies ==="
npm ci
echo "✅ Dependencies installed"

echo "\n=== 🏗️ Building CLI ==="
npm run build
npm link
echo "✅ CLI built and linked"

echo "\n=== 🧪 Running unit tests ==="
npm run test
echo "✅ Unit tests complete"

echo "\n=== 🚀 Creating test app ==="
npm create @hcl-software/dx-script-app "$APP_NAME" -- --template "$TEMPLATE"

echo "\n=== 🔍 Verifying app creation ==="
# Check if directory exists
if [ ! -d "$APP_NAME" ]; then
    echo "❌ Error: App directory was not created"
    exit 1
fi
echo "✅ App directory created successfully"

# Check if package.json exists
if [ ! -f "$APP_NAME/package.json" ]; then
    echo "❌ Error: package.json not found in the created app"
    exit 1
fi
echo "✅ package.json exists"

# Check if project name in package.json matches the app name
PROJECT_NAME_IN_PACKAGE=$(grep -m 1 '"name":' "$APP_NAME/package.json" | awk -F'"' '{print $4}')
if [ "$PROJECT_NAME_IN_PACKAGE" != "$APP_NAME" ]; then
    echo "❌ Error: Project name mismatch. Expected: $APP_NAME, Found: $PROJECT_NAME_IN_PACKAGE"
    exit 1
fi
echo "✅ Project name in package.json matches app name: $PROJECT_NAME_IN_PACKAGE"

# Unlink the CLI package to ensure clean testing environment
npm unlink -g @hcl-software/create-dx-script-app || true
echo "✅ CLI unlinked"

echo "\n=== 📦 Installing test app dependencies ==="
cd "$APP_NAME"
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error: npm install failed in the generated app"
    exit 1
fi
echo "✅ npm install successful"

echo "\n=== 🔨 Building test app ==="
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: npm run build failed in the generated app"
    exit 1
fi
echo "✅ npm run build successful"


# Only deploy if TEST_DX_DEPLOY is true (from Jenkins checkbox)
if [ "$TEST_DX_DEPLOY" = "true" ]; then
        # Update .env.local with deployment variables (all DX_* in the same format)
        echo "\n=== 📝 Writing deployment variables to .env.local ==="
        {
            echo "DX_HOSTNAME=$HOSTNAME"
            echo "DX_PORT=$DX_PORT"
            echo "DX_PROTOCOL=$DX_PROTOCOL"
            echo "DX_USERNAME=$DX_USERNAME"
            echo "DX_PASSWORD=$DX_PASSWORD"
            echo "DX_CONTENT_HANDLER_PATH=$DX_CONTENT_HANDLER_PATH"
            echo "DX_VIRTUAL_PORTAL_CONTEXT=$DX_VIRTUAL_PORTAL_CONTEXT"
            echo "DX_PROJECT_CONTEXT=$DX_PROJECT_CONTEXT"
            echo "DX_MAIN_HTML_FILE=$DX_MAIN_HTML_FILE"
            echo "DX_SITE_AREA=$DX_SITE_AREA"
            echo "DX_CONTENT_NAME=$DX_CONTENT_NAME"
            echo "DX_CONTENT_TITLE=$DX_CONTENT_TITLE"
            echo "DX_CONTENT_ROOT=$DX_CONTENT_ROOT"
        } > .env.local
        echo ".env.local content:"
        cat .env.local

    # Accept the license first
    echo "\n=== 📜 Accepting license agreement ==="
    ./node_modules/.bin/dxclient accept-license
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to accept license"
        exit 1
    fi
    echo "✅ License accepted successfully"

    echo "\n=== 🚀 Deploying test app using dx-deploy ==="
    # Capture dx-deploy output to a log file
    npm run dx-deploy | tee dx-deploy.log
    DX_DEPLOY_EXIT_CODE=${PIPESTATUS[0]}
    if [ $DX_DEPLOY_EXIT_CODE -ne 0 ]; then
        echo "❌ Error: npm run dx-deploy failed in the generated app"
        exit 1
    fi
    echo "✅ npm run dx-deploy successful"

    echo "\n=== 🕵️ Verifying generated file on server with dxclient pull ==="
    DX_WCM_CONTENT_ID=$(grep -o '"contentId":"[a-f0-9\-]\{36\}"' dx-deploy.log | head -1 | cut -d'"' -f4)
    if [ -z "$DX_WCM_CONTENT_ID" ]; then
        echo "⚠️  Could not extract contentId from dx-deploy.log. Please set DX_WCM_CONTENT_ID manually to verify."
    else
        echo "ℹ️  Using extracted contentId: $DX_WCM_CONTENT_ID"
        echo "dxclient deploy-scriptapplication pull --dxProtocol \"$DX_PROTOCOL\" --hostname \"$DX_HOSTNAME\" --dxPort \"$DX_PORT\" --dxUsername \"$DX_USERNAME\" --dxPassword \"$DX_PASSWORD\" --contenthandlerPath \"$DX_CONTENT_HANDLER_PATH\" --wcmContentId \"$DX_WCM_CONTENT_ID\""
        ./node_modules/.bin/dxclient deploy-scriptapplication pull \
            --dxProtocol "$DX_PROTOCOL" \
            --hostname "$DX_HOSTNAME" \
            --dxPort "$DX_PORT" \
            --dxUsername "$DX_USERNAME" \
            --dxPassword "$DX_PASSWORD" \
            --contenthandlerPath "$DX_CONTENT_HANDLER_PATH" \
            --wcmContentId "$DX_WCM_CONTENT_ID"
    fi
else
    echo "\n=== 🚀 Skipping deployment (TEST_DX_DEPLOY is not true) ==="
fi

cd ..

echo "\n=== 🎉 Build tests passed! ==="
echo "The create-dx-script-app CLI successfully:"
echo "- Created a new $TEMPLATE application named $APP_NAME"
echo "- Generated a valid package.json with the correct name"
echo "- Created an app that can be built successfully"

# If we deployed, add that to the success message
if [ "$TEST_DX_DEPLOY" = "true" ]; then
    echo "- Successfully deployed the app with dx-deploy"
fi