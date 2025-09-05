pipeline {
    agent any
    tools {
        nodejs "nodejs-22-6-0"
    }
    environment {
        // Store credentials securely
        MONGO_DB_CREDENTIALS = credentials('Mongo-DB-Username-password') // Assumes a username/password credential ID
        MONGO_URI = 'mongodb://adminUser:StrongPassword123@localhost:27017/planets?authSource=admin'
        MONGO_USERNAME = credentials("User_ID")
        MONGO_PASSWORD = credentials("Mongo_Password")
        NODE_ENV = 'development'
        SONAR_QUBE = tool 'sonar-qube-scanner-7.2.0';
        GIT_HUB_TOKEN = credentials('github-token')
    }
    stages {
        stage('NodeJS and NPM version') {
            steps {
                sh '''
                    node -v
                    npm -v
                '''
            }
        }

        stage('NPM install dependencies') {
            steps {
                sh '''
                    npm install
                    echo $?
                '''
            }
        }

        // Uncomment and adjust if needed
        // stage('Dependencies Scanning') {
        //     parallel {
        //         stage('NPM dependencies audit') {
        //             steps {
        //                 sh '''
        //                     npm audit --audit-level=critical
        //                     echo $?
        //                 '''
        //             }
        //         }
        //         stage('OWASP Dependency Check') {
        //             steps {
        //                 dependencyCheck additionalArguments: '''
        //                     --scan './'
        //                     --format 'ALL'
        //                     --out './'
        //                     --prettyPrint
        //                 ''', odcInstallation: 'OWASP-Dep-Check-10'
        //                 dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: true
        //                 junit allowEmptyResults: true, keepProperties: true, testResults: 'dependency-check-junit.xml'
        //                 publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'dependency-check-report.html', reportName: 'Dependency_Check HTML Report'])
        //             }
        //         }
        //     }
        // }

        stage('Unit Tests') {
            when {
                branch 'Feature_Branch'
            }
            steps {
                sh '''
                    echo Colon-Separated - $MONGO_DB_CREDENTIALS
                    echo "Username: $MONGO_DB_CREDENTIALS_USR"
                    echo "Password: $MONGO_DB_CREDENTIALS_PSW"
                    fuser -k 3000/tcp || true # Free port 3000
                    export MOCHA_FILE=test-results.xml
                    npm test
                '''
            }
            // post {
            //     always {
            //         junit allowEmptyResults: true, keepProperties: true, testResults: 'test-results.xml'
            //     }
            // }
        }

        // stage('Code Coverage') {
        //     steps {
        //         catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
        //             sh '''
        //                 npm run coverage
        //                 echo $?
        //             '''
        //         }
        //     }
        // }
        // stage('sonarQube Analysis') {
        //     steps {
        //         timeout(time: 120, unit: 'SECONDS'){
        //             withSonarQubeEnv('sonar-qube-server') {
        //                 sh 'echo $SONAR_QUBE'
        //                 sh '''
        //                     $SONAR_QUBE/bin/sonar-scanner \
        //                     -Dsonar.javascript.lcov.reportPaths=./coverage/lcov.info \
        //                     -Dsonar.projectKey=solar-system-project
        //                 '''
        //             }
        //             // waitForQualityGate abortPipeline: true
        //         } 
        //     }
        // }
        stage("build Docker Image"){
            when {
                branch 'Feature_Branch'
            }
            steps{
                sh 'docker build -t ikramulhaq6363/solar-system:$GIT_COMMIT .'
            }
        }
        // stage("trivy vulnerability scan"){
        //     steps{
        //         sh '''
        //             trivy image ikramulhaq6363/solar-system:$GIT_COMMIT \
        //             --severity LOW,MEDIUM,HIGH \
        //             --exit-code 0 \
        //             --quiet \
        //             --format json -o trivy-image-MEDIUM-report.json

        //             trivy image ikramulhaq6363/solar-system:$GIT_COMMIT \
        //             --severity CRITICAL \
        //             --exit-code 1 \
        //             --quiet \
        //             --format json -o trivy-image-CRITICAL-report.json
        //         '''
        //     }
        //     post {
        //         always {
        //             sh '''
        //             trivy convert \
        //                 --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
        //                 --output trivy-image-MEDIUM-report.html trivy-image-MEDIUM-report.json
        //             trivy convert \
        //                 --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
        //                 --output trivy-image-CRITICAL-report.html trivy-image-CRITICAL-report.json
        //             trivy convert \
        //                 --format template --template "@/usr/local/share/trivy/templates/junit.tpl" \
        //                 --output trivy-image-MEDIUM-report.xml trivy-image-MEDIUM-report.json
        //             trivy convert \
        //                 --format template --template "@/usr/local/share/trivy/templates/junit.tpl" \
        //                 --output trivy-image-CRITICAL-report.xml trivy-image-CRITICAL-report.json
        //             '''
        //         }
        //     }
        // }
        stage("push to docker hub"){
            when {
                branch 'Feature_Branch'
            }
            steps{
                withDockerRegistry(credentialsId: 'docker-hub-creds', url: "") {
                    sh 'docker push ikramulhaq6363/solar-system:$GIT_COMMIT'
                }
            }
        }

        // stage("Deploy on AWS EC2"){
        //     steps{
        //         script{
        //             sshagent(['ssh-ec2-instance-creds']) {
        //                 sh '''
        //                     ssh -o StrictHostKeyChecking=no ubuntu@3.145.130.213 "
        //                         if sudo docker ps -a | grep -q "solar-system" ; then
        //                             echo 'Container exists. Stopping and removing...'
        //                                 sudo docker stop "solar-system" && sudo docker rm "solar-system"
        //                             echo 'Old container removed.'
        //                         fi
        //                             sudo docker run --name solar-system \
        //                             -e MONGO_URI=$MONGO_URI \
        //                             -e MONGO_USERNAME=$MONGO_USERNAME \
        //                             -e MONGO_PASSWORD=$MONGO_PASSWORD \
        //                             -d -p 3000:3000 ikramulhaq6363/solar-system:$GIT_COMMIT
        //                     "
        //                 '''
        //             }
        //         }
        //     }
        // }
        stage("k8s Update Image Tag"){
            when {
                branch 'Feature_Branch'
            }
            steps{
                script {
                    if (fileExists("solar-system-gitops-argocd-gitea")) {
                        dir("solar-system-gitops-argocd-gitea") {
                            sh '''
                                git fetch origin main
                                git checkout main
                                git reset --hard origin/main
                            '''
                        }
                    } else {
                        sh 'git clone -b main https://github.com/ikramulhaq63/solar-system-gitops-argocd-gitea.git'
                    }

                    dir("solar-system-gitops-argocd-gitea/kubernetes"){
                        sh '''
                            ############ Replace docker image tag in deployment.yaml file ########
                            git checkout main
                            git checkout -b feature-$BUILD_ID
                            sed -i "s#ikramulhaq6363.*#ikramulhaq6363/solar-system:$GIT_COMMIT#g" deployment.yml
                            cat deployment.yml

                            ########## Commit and push the changes ##########
                            git config --global user.email "haq99831@gmail.com"
                            git config --global user.name "ikramulhaq"
                            git remote set-url origin https://$GIT_HUB_TOKEN@github.com/ikramulhaq63/solar-system-gitops-argocd-gitea.git
                            git add .
                            git commit -m "Update image tag to $GIT_COMMIT"
                            git push -u origin feature-$BUILD_ID
                        '''
                    }
                }
            }
        }
        stage("Create Pull Request") {
            when {
                branch 'Feature_Branch'
            }
            steps {
                script {
                    // PR title & body (you can customize these)
                    def prTitle = "Update image tag to ${GIT_COMMIT}"
                    def prBody  = "This PR updates the Kubernetes deployment image tag to commit ${GIT_COMMIT}"

                    sh """
                        curl -s -X POST \
                          -H "Authorization: token $GIT_HUB_TOKEN" \
                          -H "Accept: application/vnd.github.v3+json" \
                          https://api.github.com/repos/ikramulhaq63/solar-system-gitops-argocd-gitea/pulls \
                          -d '{
                                "title": "${prTitle}",
                                "head": "feature-${BUILD_ID}",
                                "base": "main",
                                "body": "${prBody}"
                              }'
                    """
                }
            }
        }

        stage('App Deployed?'){
            when {
                branch 'Feature_Branch'
            }
            steps{
                timeout(time: 1, unit: 'DAYS') {
                    input message: 'Has the application been deployed successfully and is it running as expected? Please verify and confirm to proceed with the DAST scan.', ok: 'Yes, proceed'
                }
            }
        }
        
        // stage('DAST - OWASP ZAP Scan') {
                // when {
                //     branch 'AWS_Production'
                // }

        //     steps {
        //         sh '''
        //             chmod 777 $(pwd)
        //             docker run -v $(pwd):/zap/wrk/:rw ghcr.io/zaproxy/zaproxy \
        //             zap-api-scan.py \
        //             -t http://100.68.106.70:30000/api-docs \
        //             -f openapi \
        //             -r zap_report.html \
        //             -w zap_report.md \
        //             -j zap_json_report.json \
        //             -x zap_xml_report.xml \
        //             -c zap_ignore_rules \
        //             -I
        //         '''
        //     }
        // }

        stage('Upload - AWS S3 Bucket') {
            when {
                branch 'Feature_Branch'
            }
            steps {
                withAWS(credentials: 'aws-ec2-s3-lambda-creds', region: 'us-east-2') {
                    sh '''
                        ls -ltr
                        mkdir reports-$BUILD_ID
                        cp -rf coverage/ reports-$BUILD_ID/
                        cp dependency*.* test-results.xml trivy*.* zap*.* reports-$BUILD_ID/
                        ls -ltr reports-$BUILD_ID
                    '''
                    s3Upload(file:"reports-$BUILD_ID/", bucket:'ikram-solar-system-bucket', path:"solar-system-app/$BUILD_ID/")
                }
            }
        }

        stage('Deploy to Production - Manual Approval') {
            when {
                branch 'AWS_Production'
            }
            steps{
                timeout(time: 1, unit: 'DAYS') {
                    input message: 'Deploy to production', ok: 'Yes, proceed', submitter: 'admin'
                }
            }
        }

        stage('lambda -s3 Upload and deploy'){
            when {
                branch 'AWS_Production'
            }
            steps{
                withAWS(credentials: 'aws-ec2-s3-lambda-creds', region: 'us-east-2') {
                    sh '''
                        # Ensure zip is installed
                        sudo apt-get update
                        sudo apt-get install -y zip

                        # Navigate to the project directory
                        cd ~/solar-system

                        # Create the ZIP file with explicit file names
                        zip -qr solar-system-lambda-$BUILD_ID.zip app.js app-controller.js app-test.js seed.js package.json package-lock.json node_modules index.html images

                        # Verify the ZIP file
                        ls -ltr solar-system-lambda-$BUILD_ID.zip

                        # Upload to S3
                        aws s3 cp solar-system-lambda-$BUILD_ID.zip s3://mysolarsystemzip/solar-system-lambda-$BUILD_ID.zip

                        # Update Lambda function
                        aws lambda update-function-code --function-name mysolarsystemapp --s3-bucket mysolarsystemzip --s3-key solar-system-lambda-$BUILD_ID.zip
                        aws lambda update-function-configuration \
                            --function-name mysolarsystemapp \
                            --handler app.handler \
                            --timeout 30 \
                            --memory-size 512 \
                            --environment "Variables={NODE_ENV=production}"
                    ''' 
                }
            }
        }
    }
    post {
        always {
            // archiveArtifacts artifacts: 'test-results.xml', allowEmptyArchive: true
            // junit allowEmptyResults: true, keepProperties: true, testResults: 'test-results.xml'
            // junit allowEmptyResults: true, keepLongStdio: true, testResults: 'trivy-image-CRITICAL-report.xml'
            // junit allowEmptyResults: true, keepLongStdio: true, testResults: 'trivy-image-MEDIUM-report.xml'
            // publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'trivy-image-CRITICAL-report.html', reportName: 'trivy Image CRITICAL Report'])
            // publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'trivy-image-MEDIUM-report.html', reportName: 'trivy Image MEDIUM Report'])
            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'zap_report.html', reportName: 'DAST - OWASP ZAP Report', reportTitles: 'DAST - OWASP ZAP Scan Report',useWrapperFileDirectly: true])
            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: 'coverage/lcov-report', reportFiles: 'index.html', reportName: 'Code Coverage HTML Report'])
        }
    }
}
