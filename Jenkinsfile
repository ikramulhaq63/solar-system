pipeline {
    agent any
    tools {
        nodejs "nodejs-22-6-0"
    }
    environment {
        // Define environment variables
        MONGO_URI = 'mongodb://adminUser:StrongPassword123@localhost:27017/planets?authSource=admin'
        // MONGO_USERNAME = 'adminUser'
        // MONGO_PASSWORD = 'StrongPassword123' // Consider using Jenkins credentials plugin for security
        // NODE_ENV = 'development'
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
        stage('Dependencies Scanning') {
            parallel {
                stage('NPM dependencies audit') {
                    steps {
                        sh '''
                            npm audit --audit-level=critical
                            echo $?
                        '''
                    }
                }
                stage('OWASP Dependency Check') {
                    steps {
                        dependencyCheck additionalArguments: '''
                            --scan './'
                            --format 'ALL'
                            --out './'
                            --prettyPrint
                        ''', odcInstallation: 'OWASP-Dep-Check-10'
                        dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: true
                        junit allowEmptyResults: true, keepProperties: true, testResults: 'dependency-check-junit.xml'
                        publishHTML([allowMissing: true, alwaysLinkToLastBuild: true, icon: '', keepAll: true, reportDir: './', reportFiles: 'dependency-check-report.html', reportName: 'Dependency_CheckHTML Report', reportTitles: '', useWrapperFileDirectly: true])
                    }
                }
        stage('unit tests') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'Mongo-DB-Username-password', passwordVariable: 'MONGO_PASSWORD', usernameVariable: 'MONGO_USERNAME')]) {
                    sh '''
                        npm test
                    '''
                }

                junit allowEmptyResults: true, keepProperties: true, testResults: 'test-results.xml'
            }
        }
            }
        }
    }
}
