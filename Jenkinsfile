pipeline {
    agent any
    tools {
        nodejs "nodejs-22-6-0"
    }
    environment {
        // Store credentials securely
        MONGO_DB_CREDENTIALS = credentials('Mongo-DB-Username-password') // Assumes a username/password credential ID
        MONGO_URI = 'mongodb://adminUser:StrongPassword123@localhost:27017/planets?authSource=admin'
        MONGO_USERNAME = "User_ID"
        MONGO_PASSWORD = "Mongo_Password"
        NODE_ENV = 'development'
    }
    stages {
        stage('Nodejs version') {
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
            post {
                always {
                    junit allowEmptyResults: true, keepProperties: true, testResults: 'test-results.xml'
                }
            }
        }

        stage('Code Coverage') {
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                    sh '''
                        npm run coverage
                        echo $?
                    '''
                }
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'test-results.xml', allowEmptyArchive: true
            publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: 'coverage/lcov-report', reportFiles: 'index.html', reportName: 'Code Coverage HTML Report'])
        }
    }
}
