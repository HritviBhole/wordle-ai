#!/bin/bash
# ============================================================
# Wordle Solver — GCP Cloud Run Deployment Script
# Serverless, auto-scaling, zero cold-start config
# Requirements: gcloud CLI, Docker
# Usage: ./deploy-gcp.sh <project-id> <region>
# ============================================================
set -euo pipefail

PROJECT_ID=${1:-my-gcp-project}
REGION=${2:-us-central1}
REGISTRY="gcr.io/$PROJECT_ID"

echo "🚀 Deploying Wordle Solver to GCP Cloud Run"
echo "Project: $PROJECT_ID | Region: $REGION"

# ── Authenticate ──────────────────────────────────────────
gcloud auth configure-docker --quiet

# ── Build & Push ──────────────────────────────────────────
echo "→ Building backend..."
docker build -t "$REGISTRY/wordle-backend:latest" ./backend
docker push "$REGISTRY/wordle-backend:latest"

echo "→ Deploying backend to Cloud Run..."
BACKEND_URL=$(gcloud run deploy wordle-backend \
  --image "$REGISTRY/wordle-backend:latest" \
  --platform managed \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --port 8000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --format "value(status.url)")

echo "   Backend URL: $BACKEND_URL"

echo "→ Building frontend with backend URL..."
docker build \
  --build-arg VITE_API_URL="$BACKEND_URL" \
  -t "$REGISTRY/wordle-frontend:latest" ./frontend
docker push "$REGISTRY/wordle-frontend:latest"

echo "→ Deploying frontend to Cloud Run..."
FRONTEND_URL=$(gcloud run deploy wordle-frontend \
  --image "$REGISTRY/wordle-frontend:latest" \
  --platform managed \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --allow-unauthenticated \
  --port 80 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --format "value(status.url)")

echo ""
echo "✅ Deployment complete!"
echo "   🌐 Frontend: $FRONTEND_URL"
echo "   🔧 Backend:  $BACKEND_URL"
echo "   📖 API Docs: $BACKEND_URL/docs"
