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

        // Uncomment this block if you want npm audit
        /*
        stage('NPM dependencies audit') {
            steps {
                sh '''
                    npm audit --audit-level=critical
                    echo $?
                '''
            }
        }
        */
    }
}

