#!/bin/bash
# ══════════════════════════════════════════════════════════
#  Wordle Solver — AWS ECS Fargate Deployment Script
#  Prerequisites: AWS CLI configured, Docker, jq
# ══════════════════════════════════════════════════════════
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO_BACKEND="wordle-solver-backend"
ECR_REPO_FRONTEND="wordle-solver-frontend"
ECS_CLUSTER="wordle-solver-cluster"

echo "Deploying Wordle Solver to AWS ECS Fargate..."
echo "Account: $AWS_ACCOUNT_ID | Region: $AWS_REGION"

# Create ECR repos
for repo in $ECR_REPO_BACKEND $ECR_REPO_FRONTEND; do
  aws ecr describe-repositories --repository-names "$repo" --region "$AWS_REGION" 2>/dev/null || \
  aws ecr create-repository --repository-name "$repo" --region "$AWS_REGION"
done

# Docker login
aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Build & push
BACKEND_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_BACKEND:latest"
FRONTEND_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_FRONTEND:latest"
docker build -t $ECR_REPO_BACKEND ./backend && docker tag $ECR_REPO_BACKEND:latest $BACKEND_URI && docker push $BACKEND_URI
docker build -t $ECR_REPO_FRONTEND ./frontend && docker tag $ECR_REPO_FRONTEND:latest $FRONTEND_URI && docker push $FRONTEND_URI

# Create cluster
aws ecs describe-clusters --clusters "$ECS_CLUSTER" --region "$AWS_REGION" | \
  grep -q '"status": "ACTIVE"' || \
  aws ecs create-cluster --cluster-name "$ECS_CLUSTER" --region "$AWS_REGION"

echo "Images pushed. Create ALB + ECS Services via AWS Console or Terraform."
echo "Backend: $BACKEND_URI"
echo "Frontend: $FRONTEND_URI"
