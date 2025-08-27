pipeline {
    agent any
    tools {
        nodejs "nodejs-22-6-0"
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
        stage('NPM dependencies audit') {
            steps {
                sh '''
                    npm audit --audit-level=critical
                    echo $?
                '''
            }
        }
    }
}

