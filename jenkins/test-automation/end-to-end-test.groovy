/* ======================================================================== *
 * Copyright 2025 HCL America Inc.                                          *
 * Licensed under the Apache License, Version 2.0 (the "License");          *
 * you may not use this file except in compliance with the License.         *
 * You may obtain a copy of the License at                                  *
 *                                                                          *
 * http://www.apache.org/licenses/LICENSE-2.0                               *
 *                                                                          *
 * Unless required by applicable law or agreed to in writing, software      *
 * distributed under the License is distributed on an "AS IS" BASIS,        *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. *
 * See the License for the specific language governing permissions and      *
 * limitations under the License.                                           *
 * ======================================================================== */
def PROJECT_NAME = 'create-dx-script-app'
def NODE_VERSION = '20'
@Library("dx-shared-library") _
pipeline {
    agent {
        label 'prcheck_test'    
    }
    parameters {
        choice(
            name: 'TEMPLATE',
            choices: ['react-js', 'react-ts', 'nex-haven-store-locator-sample'],
            description: 'Template to use for E2E testing'
        )
        string(
            name: 'APP_NAME',
            defaultValue: 'e2e-test-app',
            description: 'Name for the test application'
        )
        string(
            name: 'HOSTNAME',
            defaultValue: 'create-dx-script-app.team-q-dev.com',
            description: 'Hostname to use in config.json (e.g., localhost, example.com)'
        )
        string(
            name: 'DX_PORT',
            defaultValue: '443',
            description: 'Port number to use in config.json'
        )
        string(
            name: 'DX_PROTOCOL',
            defaultValue: 'https',
            description: 'Protocol to use for DX (e.g., http, https)'
        )
        // DX_USERNAME and DX_PASSWORD are now injected via Jenkins credentials (see withCredentials block below)
        string(
            name: 'DX_CONTENT_HANDLER_PATH',
            defaultValue: '/wps/mycontenthandler',
            description: 'DX content handler path'
        )
        string(
            name: 'DX_VIRTUAL_PORTAL_CONTEXT',
            defaultValue: '',
            description: 'DX virtual portal context (optional)'
        )
        string(
            name: 'DX_PROJECT_CONTEXT',
            defaultValue: '',
            description: 'DX project context (optional)'
        )
        string(
            name: 'DX_MAIN_HTML_FILE',
            defaultValue: 'index.html',
            description: 'DX main HTML file'
        )
        string(
            name: 'DX_SITE_AREA',
            defaultValue: 'Script Application Library/Script Applications/',
            description: 'DX site area'
        )
        string(
            name: 'DX_CONTENT_NAME',
            defaultValue: 'my-script-app',
            description: 'DX content name'
        )
        string(
            name: 'DX_CONTENT_TITLE',
            defaultValue: '',
            description: 'DX content title (optional)'
        )
        string(
            name: 'DX_CONTENT_ROOT',
            defaultValue: './dist',
            description: 'DX content root directory'
        )
        booleanParam(
            name: 'TEST_DX_DEPLOY',
            defaultValue: false,
            description: 'Run dx-deploy test after building the app'
        )
    }
    environment {
        PROJECT_NAME = "${PROJECT_NAME}"
        NODE_VERSION = "${NODE_VERSION}"
        TEMPLATE = "${params.TEMPLATE ?: 'react-js'}"
        APP_NAME = "${params.APP_NAME ?: 'e2e-test-app'}"
        DX_PROTOCOL = "${params.DX_PROTOCOL ?: 'https'}"
    }
    options {
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
    }
    stages {
        stage('Launching a native kube instance') {
            when {
                expression {
                    return params.TEST_DX_DEPLOY && params.HOSTNAME == 'create-dx-script-app.team-q-dev.com'
                }
            }
            steps {
                echo "Launching DX Core"
                script {
                    buildParameters = []
                    buildParameters.add(string(name: 'INSTANCE_NAME', value: 'create-dx-script-app'))
                    // create-dx-script-app.team-q-dev.com
                    buildParameters.add(string(name: 'BUILD_USER_ID', value: 'markkevin.besinga@hcl.com'))
                    buildParameters.add(string(name: 'NEXT_JOB_DELAY_HOURS', value: '0'))

                    buildParameters.add(string(name: 'IMAGE_REPOSITORY', value: 'quintana-docker'))

                    buildParameters.add(booleanParam(name: 'DISABLE_DESIGN_STUDIO', value: true))
                    buildParameters.add(booleanParam(name: 'DISABLE_REMOTESEARCH', value: true))
                    buildParameters.add(booleanParam(name: 'DISABLE_CONTENTCOMPOSER', value: true))
                    buildParameters.add(booleanParam(name: 'DISABLE_DAM', value: true))
                    buildParameters.add(booleanParam(name: 'DISABLE_KALTURA_PLUGIN', value: true))
                    buildParameters.add(booleanParam(name: 'DISABLE_RINGAPI', value: true))
                    buildParameters.add(booleanParam(name: 'DISABLE_PERSISTENCE', value: true))
                    buildParameters.add(booleanParam(name: 'DISABLE_PLUGIN_GOOGLE_VISION', value: true))
                    buildParameters.add(booleanParam(name: 'PERFORMANCE_RUN', value: true))
                    buildParameters.add(booleanParam(name: 'DISABLE_IMAGEPROCESSOR', value: true))
                    buildParameters.add(booleanParam(name: 'DISABLE_AMBASSADOR', value: true))
                    buildParameters.add(booleanParam(name: 'DISABLE_RUNTIME_CONTROLLER', value: true))
                    buildParameters.add(booleanParam(name: 'DISABLE_OPENLDAP', value: true))
                    buildParameters.add(booleanParam(name: 'DISABLE_LICENSE_MANAGER', value: true))

                    // Use the defined instance type from the application repo
                    // If non provided, fall back to this pipelines default

                    // There is no schedule required for these machines
                    buildParameters.add(string(name: 'NATIVE_POPO_SCHEDULE', value: 'n/a'))

                    echo "kube deploy values are: ${buildParameters}"

                    build(
                        job: "CI/kube-deploy/native-kube-next-deploy",
                        parameters: buildParameters,
                        propagate: true,
                        wait: true
                    )
                }
            }
        }
        stage('Setup Node') {
            steps {
                script {
                    // Use NodeJS plugin if available
                    if (fileExists('.nvmrc')) {
                        def nodeVer = readFile('.nvmrc').trim()
                        env.NODE_VERSION = nodeVer
                    }
                    // Set NVM_NODE_VERSION for the nvm wrapper
                    env.NVM_NODE_VERSION = env.NODE_VERSION
                }
            }
        }
        
        stage('Create and Build App') {
            steps {
                script {
                    // Make the test script executable
                    sh 'chmod +x ./__tests__/e2e/e2e-test.sh'
                    // Inject DX credentials only for this block
                    nvm("${env.NVM_NODE_VERSION}") {
                        withNPM(npmrcConfig:"npmrc") {
                            withCredentials([
                                [$class: 'UsernamePasswordMultiBinding', credentialsId: "${DX_CREDENTIALS_ID}", usernameVariable: 'DX_USERNAME', passwordVariable: 'DX_PASSWORD']
                            ]) {
                                sh """
                                    # Pass parameters to the test script via environment variables
                                    export APP_NAME=${env.APP_NAME}
                                    export TEMPLATE=${env.TEMPLATE}
                                    export HOSTNAME=${params.HOSTNAME}
                                    export DX_PORT=${params.DX_PORT}
                                    export DX_PROTOCOL=${params.DX_PROTOCOL}
                                    export DX_USERNAME=$DX_USERNAME
                                    export DX_PASSWORD=$DX_PASSWORD
                                    export SKIP_DEPLOY=true
                                    export TEST_DX_DEPLOY=${params.TEST_DX_DEPLOY}
                                    
                                    # Run the test script
                                    ./__tests__/e2e/e2e-test.sh
                                """
                            }
                        }
                    }
                }
            }
        }
        
        
        stage('Finish Without Deployment') {
            when {
                expression { return !params.TEST_DX_DEPLOY }
            }
            steps {
                script {
                    echo "\n=== 🎉 Build tests passed! ==="
                    echo "The create-dx-script-app CLI successfully:"
                    echo "- Created a new ${env.TEMPLATE} application named ${env.APP_NAME}"
                    echo "- Generated a valid package.json with the correct name"
                    echo "- Created an app that can be built successfully"
                    echo "- Configured with hostname: ${params.HOSTNAME} and dxPort: ${params.DX_PORT}"
                    echo "⚠️ Deployment test was skipped (TEST_DX_DEPLOY parameter is false)"
                }
            }
        }
    }
    /*
     * Post processing steps
     */
    post {
        success {
            echo '✅ End-to-End tests passed successfully!'
        }
        failure {
            echo '❌ End-to-End tests failed. Check the logs for details.'
        }
        cleanup {
            /* Cleanup workspace */
            dir("${workspace}") {
                deleteDir()
            }
            /* Cleanup workspace@tmp */
            dir("${workspace}@tmp") {
                deleteDir()
            }
            dxWorkspaceDirectoriesCleanup()
            script {
                // After a test execution, the EC2 instance is not required anymore and will be deleted.
                buildParameters = []
                buildParameters.add(string(name: 'INSTANCE_NAME', value: 'create-dx-script-app'))
                buildParameters.add(string(name: 'BUILD_USER_ID', value: 'markkevin.besinga@hcl.com'))
                build(
                    job: "CI/kube-deploy/native-kube-remove",
                    parameters: buildParameters,
                    propagate: true,
                    wait: true
                )
            }
        }
    }
}
