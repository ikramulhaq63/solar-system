pipeline {
    agent any
    tools {
        nodejs "nodejs-22-6-0"
    }
    environment {
        MONGO_DB_CREDENTIALS = credentials('Mongo-DB-Username-password')
        MONGO_URI = 'mongodb://adminUser:StrongPassword123@100.113.62.93:27017/planets?authSource=admin'
        MONGO_USERNAME = credentials("User_ID")
        MONGO_PASSWORD = credentials("Mongo_Password")
        NODE_ENV = 'development'
        SONAR_QUBE = tool 'sonar-qube-scanner-7.2.0'
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

        stage('Unit Tests') {
            when {
                branch 'Feature_Branch'
            }
            steps {
                sh '''
                    echo Colon-Separated - $MONGO_DB_CREDENTIALS
                    echo "Username: $MONGO_DB_CREDENTIALS_USR"
                    echo "Password: $MONGO_DB_CREDENTIALS_PSW"
                    fuser -k 3000/tcp || true
                    export MOCHA_FILE=test-results.xml
                    npm test
                '''
            }
        }

        stage("build Docker Image") {
            when {
                branch 'Feature_Branch'
            }
            steps {
                sh 'docker build -t ikramulhaq6363/solar-system:$GIT_COMMIT .'
            }
        }

        stage("push to docker hub") {
            when {
                branch 'Feature_Branch'
            }
            steps {
                withDockerRegistry(credentialsId: 'docker-hub-creds', url: "") {
                    sh 'docker push ikramulhaq6363/solar-system:$GIT_COMMIT'
                }
            }
        }

        stage("k8s Update Image Tag") {
            when {
                branch 'Feature_Branch'
            }
            steps {
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

                    dir("solar-system-gitops-argocd-gitea/kubernetes") {
                        sh '''
                            git checkout main
                            git checkout -b feature-$BUILD_ID
                            sed -i "s#ikramulhaq6363.*#ikramulhaq6363/solar-system:$GIT_COMMIT#g" deployment.yml
                            cat deployment.yml
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
                    def prTitle = "Update image tag to ${GIT_COMMIT}"
                    def prBody = "This PR updates the Kubernetes deployment image tag to commit ${GIT_COMMIT}"
                    sh """
                        curl -s -X POST \
                          -H "Authorization: token $GIT_HUB_TOKEN" \
                          -H "Accept: application/vnd.github.v3+json" \
                          https://api.github.com/repos/ikramulhaq63/solar-system-gitops-argocd-gitea/pulls \
                          -d '{"title": "${prTitle}", "head": "feature-${BUILD_ID}", "base": "main", "body": "${prBody}"}'
                    """
                }
            }
        }

        stage('App Deployed?') {
            when {
                branch 'Feature_Branch'
            }
            steps {
                timeout(time: 1, unit: 'DAYS') {
                    input message: 'Has the application been deployed successfully and is it running as expected? Please verify and confirm to proceed with the DAST scan.', ok: 'Yes, proceed'
                }
            }
        }

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
            steps {
                timeout(time: 1, unit: 'DAYS') {
                    input message: 'Deploy to production', ok: 'Yes, proceed', submitter: 'admin'
                }
            }
        }

        stage('lambda -s3 Upload and deploy') {
            when {
                branch 'AWS_Production'
            }
            steps {
                withAWS(credentials: 'aws-ec2-s3-lambda-creds', region: 'us-east-2') {
                    sh '''
                        # Navigate to the project directory
                        cd ~/solar-system

                        # Create the ZIP file with explicit file names
                        zip -qr solar-system-lambda-$BUILD_ID.zip app.js app-controller.js app-test.js seed.js package.json package-lock.json node_modules index.html images

                        # Verify the ZIP file
                        ls -ltr solar-system-lambda-$BUILD_ID.zip

                        # Upload to S3
                        aws s3 cp solar-system-lambda-$BUILD_ID.zip s3://mysolarsystemzip/solar-system-lambda-$BUILD_ID.zip

                        # Update Lambda function configuration
                        aws lambda update-function-configuration \
                            --function-name mysolarsystemapp \
                            --handler app.handler \
                            --timeout 30 \
                            --memory-size 512 \
                            --environment "{\"Variables\":{\"MONGO_URI\":\"mongodb://$MONGO_DB_CREDENTIALS_USR:$MONGO_DB_CREDENTIALS_PSW@100.113.62.93:27017/planets?authSource=admin\",\"MONGO_USERNAME\":\"$MONGO_DB_CREDENTIALS_USR\",\"MONGO_PASSWORD\":\"$MONGO_DB_CREDENTIALS_PSW\",\"NODE_ENV\":\"production\"}}"

                        # Update Lambda function code
                        aws lambda update-function-code --function-name mysolarsystemapp --s3-bucket mysolarsystemzip --s3-key solar-system-lambda-$BUILD_ID.zip
                    '''
                }
            }
        }
    }
    post {
        always {
            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'zap_report.html', reportName: 'DAST - OWASP ZAP Report', reportTitles: 'DAST - OWASP ZAP Scan Report', useWrapperFileDirectly: true])
            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: 'coverage/lcov-report', reportFiles: 'index.html', reportName: 'Code Coverage HTML Report'])
        }
    }
}