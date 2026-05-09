#!/bin/bash

echo "========================================"
echo "  Fair Acres Hotel Management System"
echo "========================================"
echo ""

# Check if node_modules exist
if [ ! -d "Backend/node_modules" ]; then
    echo "Installing Backend dependencies..."
    cd Backend && npm install && cd ..
fi

if [ ! -d "Frontend/node_modules" ]; then
    echo "Installing Frontend dependencies..."
    cd Frontend && npm install && cd ..
fi

echo "Starting Backend Server..."
cd Backend
npm start &
BACKEND_PID=$!
cd ..

sleep 3

echo "Starting Frontend..."
cd Frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "Both servers are running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Keep script running
wait
