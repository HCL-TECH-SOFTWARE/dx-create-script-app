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

pipeline { 
    /*
     * Timeout set to one hour, automatically killing stale jobs
     */
    options {
      timeout(time: 60, unit: 'MINUTES') 
    }    

    /*
     * Run on a prcheck_build agent.
     */
    agent {
        label 'prcheck_build'    
    }

    /*
     * Execute Build actions
     */
    stages {
        stage('run build'){
            steps {
                // Allow override for testing of new NodeJS versions. If no override provided, global variable is used
                script {
                    if(!env.NVM_NODE_VERSION) {
                        env.NVM_NODE_VERSION = env.G_NVM_NODE_VERSION
                    }
                }
                nvm("${env.NVM_NODE_VERSION}") {
                    withNPM(npmrcConfig:"npmrc") {
                        echo 'Installing npm packages.'
                        sh """
                            npm install
                            npm run build
                        """
                    }
                }
            }
        }
    }

    /*
     * Post processing steps
     */
    post {
        cleanup {
            /* Cleanup workspace */
            dir("${workspace}") {
                deleteDir()
            }
            /* Cleanup workspace@tmp */
            dir("${workspace}@tmp") {
                deleteDir()
            }
        }
    }  
}