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

@Library('dx-shared-library') _
pipeline { 
    parameters {
        string(name: 'GIT_BRANCH_NAME', defaultValue: 'mend-scan', description: 'Git branch name')
    }
    
    agent {
        label 'build_docker'
    }
    
    stages {
        stage('Run Build') {
            steps {
              withNPM(npmrcConfig: "npmrc") {
                nvm("${G_NVM_NODE_VERSION}") {
                  dir("${workspace}") {
                    sh """
                        npm ci
                        npm run build-zip
                    """
                  }
                }
              }
            }
        }
        
        /*
         * Upload CLI zip file to artifactory. The file name will include:
         * - Version from package.json
         * - Build date/time
         * - Environment name
         * - Branch name
         */
        stage('Uploading CLI zip to Artifactory') {
            steps {
                // setup
                withNPM(npmrcConfig:"npmrc") {
                    nvm("${G_NVM_NODE_VERSION}") {
                        script {
                            // Get version from package.json
                            def packageJSON = readJSON file: 'package.json'
                            def packageVersion = packageJSON.version
                            
                            echo "Build is running in the ${env.G_JENKINS_BUILD_ENV_NAME} environment"
                            // replace all "/" in the branch name
                            env.ESCAPED_GIT_BRANCH_NAME = "${params.GIT_BRANCH_NAME}".replace("origin/", "").replace("/", "_")
                            echo "Escaped the branchname from ${params.GIT_BRANCH_NAME} to ${env.ESCAPED_GIT_BRANCH_NAME}"
                            
                            def date = new Date()
                            env.formattedDate = date.format("yyyyMMdd-HHmm")
                            env.buildVersion = "${packageVersion}_${env.formattedDate}_${env.G_JENKINS_BUILD_ENV_NAME}_${env.ESCAPED_GIT_BRANCH_NAME}"
                            
                            // sets the display name into the buildVersion
                            currentBuild.displayName = env.buildVersion
                        }
                    }
                }

                // actual uploading of the zip file to the artifactory
                withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: "artifactory",
                usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
                    dir("${WORKSPACE}") {
                        script {
                            // gets all zip files under the output folder, and ONLY GETS THE FIRST ONE.
                            def zipFiles = findFiles(glob: 'output/zip/*.zip')
                            if (zipFiles) {
                                sh "curl -s -u${USERNAME}:${PASSWORD} -T ./output/zip/${zipFiles[0].name} https://${G_ARTIFACTORY_HOST}/artifactory/${G_ARTIFACTORY_GENERIC_NAME}/create-dx-script-app/create-dx-script-app-${env.buildVersion}.zip"
                                echo "zip destination https://${G_ARTIFACTORY_HOST}/artifactory/${G_ARTIFACTORY_GENERIC_NAME}/create-dx-script-app/create-dx-script-app-${env.buildVersion}.zip"
                            } else {
                                error "Cannot find any zip files under ./output/zip/"
                            }
                        }
                    }
                }
            }
        }
    }
    
    post {
        cleanup {
            /* Cleanup workspace */
            dxWorkspaceDirectoriesCleanup()
        }
    }
}