#!/bin/bash
echo "$GOOGLE_CLIENT_SECRETS_B64" | base64 --decode > /tmp/client_secret.json
export GOOGLE_CLIENT_SECRETS_FILE=/tmp/client_secret.json
celery -A app.celery_task.c_app worker --loglevel=info --concurrency=1
