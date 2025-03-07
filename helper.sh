#!/bin/bash

if [[ $1 = 'config' ]]; then
    chmod +x ./backend/entrypoint.sh
    cat .env.example >> backend/.env
    echo ".env создан. "
    echo "Смените в backend/.env:"
    echo "SECRET_KEY"
    echo "NGINX_HOST"
    echo "SMTP"
    echo "SMS"
fi

if [[ $1 = 'deploy' ]]; then
    echo "Deploying.."
    docker compose down
    docker compose up -d --build
    echo "Deployed"
fi

if [[ $1 = 'stop' ]]; then
    echo "Stoped"
    # shellcheck disable=SC2046
    docker stop $(docker ps -a -q)
fi

if [[ $1 = 'django' ]]; then
    echo "Starting backend"
    docker compose up backend --build -d
fi

if [[ $1 = 'dbash' ]]; then
    echo "Opening backend shell"
    docker compose exec -it backend bash
fi

if [[ $1 = 'logs' ]]; then
    echo "Django logs"
    docker compose logs backend
fi