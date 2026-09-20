#!/bin/bash
if [[ "$GOOGLE_CLIENT_SECRETS_FILE" == ey* ]]; then
    echo "$GOOGLE_CLIENT_SECRETS_FILE" | base64 --decode > /tmp/client_secret.json
    export GOOGLE_CLIENT_SECRETS_FILE=/tmp/client_secret.json
elif [ -n "$GOOGLE_CLIENT_SECRETS_B64" ]; then
    echo "$GOOGLE_CLIENT_SECRETS_B64" | base64 --decode > /tmp/client_secret.json
    export GOOGLE_CLIENT_SECRETS_FILE=/tmp/client_secret.json
elif [ -n "$GOOGLE_CLIENT_SECRETS_JSON" ]; then
    echo "$GOOGLE_CLIENT_SECRETS_JSON" > /tmp/client_secret.json
    export GOOGLE_CLIENT_SECRETS_FILE=/tmp/client_secret.json
fi
celery -A app.celery_task.c_app worker --loglevel=info --concurrency=1

