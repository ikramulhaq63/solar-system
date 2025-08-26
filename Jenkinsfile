pipeline {
    agent any
    tools {
        nodejs "nodejs-22-6-0"
    }
    stages {
        stage('Nodejs version') { // Fixed: stage block needs 'name' inside quotes and proper syntax
            steps {
                sh '''
                node -v
                '''
            }
        }
        // stage('NPM dependencies audit') { // Uncomment and fix if needed
        //     steps {
        //         sh '''
        //         npm audit --audit-level=critical
        //         echo $?
        //         '''
        //     }
        // }
    }
}
