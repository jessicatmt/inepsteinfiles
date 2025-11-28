.PHONY: help install install-website install-pipeline dev build start lint test test-watch test-coverage clean deploy

# Default target
help:
	@echo "InEpsteinFiles.com - Available Commands:"
	@echo ""
	@echo "Website Development:"
	@echo "  make install          Install website dependencies (npm install)"
	@echo "  make dev              Start development server (http://localhost:3000)"
	@echo "  make build            Build website for production"
	@echo "  make start            Start production server"
	@echo "  make lint             Run ESLint"
	@echo "  make test             Run tests"
	@echo "  make test-watch       Run tests in watch mode"
	@echo "  make test-coverage    Run tests with coverage"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy           Deploy to production (git push origin main)"
	@echo ""
	@echo "Data Pipeline:"
	@echo "  make install-pipeline Install Python dependencies"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean            Clean build artifacts and node_modules"
	@echo "  make help             Show this help message"

# Website installation
install: install-website

install-website:
	@echo "Installing website dependencies..."
	cd website && npm install

# Data pipeline installation
install-pipeline:
	@echo "Installing Python dependencies..."
	cd data-pipeline && pip install -r requirements.txt

# Website development
dev: install-website
	@echo "Starting development server..."
	cd website && npm run dev

# Website build
build:
	@echo "Building website for production..."
	cd website && npm run build

# Website production start
start:
	@echo "Starting production server..."
	cd website && npm run start

# Linting
lint:
	@echo "Running ESLint..."
	cd website && npm run lint

# Testing
test:
	@echo "Running tests..."
	cd website && npm run test

test-watch:
	@echo "Running tests in watch mode..."
	cd website && npm run test:watch

test-coverage:
	@echo "Running tests with coverage..."
	cd website && npm run test:coverage

# Deployment
deploy:
	@echo "Deploying to production (Vercel)..."
	git push origin main

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf website/.next
	rm -rf website/node_modules
	rm -rf website/.turbo
	@echo "Done. Run 'make install' to reinstall dependencies."

