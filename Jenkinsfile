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
            steps{
                script {
                    if (fileExists("solar-system-gitops-argocd-gitea")) {
                        dir("solar-system-gitops-argocd-gitea") {
                            sh '''
                                git fetch origin main
                                git reset --hard origin/main
                                git pull
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
                            sed -i "s#ikramulhaq6363.*#ikramulhaq6363/solar-system:$GIT_COMMIT#g" deployment.yaml
                            cat deployment.yaml

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

    }
    post {
        always {
            // archiveArtifacts artifacts: 'test-results.xml', allowEmptyArchive: true
            // junit allowEmptyResults: true, keepProperties: true, testResults: 'test-results.xml'
            // junit allowEmptyResults: true, keepLongStdio: true, testResults: 'trivy-image-CRITICAL-report.xml'
            // junit allowEmptyResults: true, keepLongStdio: true, testResults: 'trivy-image-MEDIUM-report.xml'
            // publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'trivy-image-CRITICAL-report.html', reportName: 'trivy Image CRITICAL Report'])
            // publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'trivy-image-MEDIUM-report.html', reportName: 'trivy Image MEDIUM Report'])
            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: 'coverage/lcov-report', reportFiles: 'index.html', reportName: 'Code Coverage HTML Report'])
        }
    }
}
