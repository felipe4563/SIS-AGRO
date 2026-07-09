#!/bin/bash
# Script de actualización — ejecutar en el VPS desde /home/ubuntu/SISTEMAS/SIS-AGRO
# Uso: bash deploy/deploy.sh

set -e
cd /home/ubuntu/SISTEMAS/SIS-AGRO

echo "==> Obteniendo cambios..."
git pull origin main

echo "==> Instalando dependencias del backend..."
cd backend && npm install --omit=dev && cd ..

echo "==> Construyendo frontend principal..."
cd frontend && npm install && npm run build && cd ..

echo "==> Construyendo frontend admin..."
cd frontend-admin && npm install && npm run build && cd ..

echo "==> Reiniciando servicio..."
pm2 reload agro-api

echo "==> Recargando Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "Despliegue completado"
pm2 status agro-api
