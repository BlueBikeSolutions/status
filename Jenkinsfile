node('master') {
  ansiColor('xterm') {
    stage('Cloning Repo') {
      git credentialsId: 'ghsignin', url: 'https://github.com/BlueBikeSolutions/status'
      checkout scm
      echo "\u2600 BUILD_URL=${env.BUILD_URL}"
      def workspace = pwd()
      echo "\u2600 workspace=${workspace}"
    }
    dir(path: 'page') {
      stage('Build page Dockerfile') {
        sh '''
          docker tag bbs-status:latest bbs-status:latest-old || true
          docker build -t bbs-status:latest .
          docker rm bbs-status:latest-old || true
        '''
      }
      stage('Running page Build/Upload') {
        sh '''
          docker run \
            --rm \
            --volume $(pwd)/src:/code/src \
            --volume $(pwd)/public:/code/public \
            --volume $(pwd)/services:/code/services \
            --env ENVIRONMENT=nonprod \
            bbs-status:latest \
            /code/run.sh
        '''
      }
    }
    dir(path: 'checker') {
      stage("Docker Login") {
        sh '''
        eval "$(docker run --rm awscli ecr get-login --no-include-email --region ap-southeast-2)"
        '''
      }
      withEnv(['DOCKER_IMAGE=696234038582.dkr.ecr.ap-southeast-2.amazonaws.com/status-page-checker']) {
        stage('Build checker Dockerfile') {
          sh '''
            set -e
            docker pull $DOCKER_IMAGE:latest || true
            docker build -t $DOCKER_IMAGE:$BUILD_NUMBER .
            docker tag $DOCKER_IMAGE:$BUILD_NUMBER $DOCKER_IMAGE:latest
            docker push $DOCKER_IMAGE:$BUILD_NUMBER
            docker push $DOCKER_IMAGE:latest
          '''
        }
      }
    }
  }
}
