pipeline {
    agent any
    tools {
        nodejs "nodejs-22-6-0"
    }
    stages {
        stage{
            name "Nodejs version"
            steps {
                sh '''
                node -v
                npm -v
                '''
            }
        }
        // stage{
        //     name "NPM dependencies audit"
        //     steps{
        //         sh '''
        //         npm audit --audit-level=critical
        //         echo $?
        //         '''
        //     }
        // }
    }
}
