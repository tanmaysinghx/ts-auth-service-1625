pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build & Test') {
            steps {
                dir('backend/ts-auth-service-1625') {
                    sh 'npm ci'
                    sh 'npm test'
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                dir('backend/ts-auth-service-1625') {
                    sh 'docker build -t ts-auth-service-1625 .'
                }
            }
        }
        stage('Deploy') {
            steps {
                dir('.') {  // Assuming docker-compose.yml at repo root
                    sh 'docker compose up -d ts-auth-service-1625'
                }
            }
        }
    }
}
