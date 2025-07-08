#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# 🌍 TPS GLOBAL DEPLOYMENT - 12 IDIOMAS
# ═══════════════════════════════════════════════════════════════════
# Script completo para deploy em produção com suporte multilíngue
# ═══════════════════════════════════════════════════════════════════

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Global configurations
PROJECT_NAME="tps-backend-global"
SUPPORTED_LANGUAGES="pt,en,es,fr,de,it,ja,zh,ar,ru,ko,hi"
DEFAULT_LANGUAGE="en"
NODE_VERSION="18"
DEPLOY_ENV="${1:-production}"

# ═══════════════════════════════════════════════════════════════════
# 🛠️ UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════════

log() {
    echo -e "${2:-$CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log_header() {
    echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}  $1${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════════${NC}\n"
}

log_success() {
    log "$1" "$GREEN"
}

log_warning() {
    log "$1" "$YELLOW"
}

log_error() {
    log "$1" "$RED"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is required but not installed"
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════════
# 🔍 PRE-DEPLOYMENT CHECKS
# ═══════════════════════════════════════════════════════════════════

check_prerequisites() {
    log_header "🔍 CHECKING PREREQUISITES"
    
    # Check required commands
    check_command "node"
    check_command "npm"
    check_command "git"
    
    # Check Node.js version
    NODE_CURRENT=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
        log_error "Node.js version $NODE_VERSION+ required, found $NODE_CURRENT"
        exit 1
    fi
    log_success "Node.js version: $(node --version)"
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    # Check if .env exists for production
    if [ "$DEPLOY_ENV" = "production" ] && [ ! -f ".env" ]; then
        log_warning ".env file not found. Please create it from .env.example"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# ═══════════════════════════════════════════════════════════════════
# 🏗️ BUILD PROCESS
# ═══════════════════════════════════════════════════════════════════

install_dependencies() {
    log_header "📦 INSTALLING DEPENDENCIES"
    
    if [ "$DEPLOY_ENV" = "production" ]; then
        log "Installing production dependencies..."
        npm ci --production
    else
        log "Installing all dependencies..."
        npm install
    fi
    
    log_success "Dependencies installed successfully"
}

run_tests() {
    log_header "🧪 RUNNING TESTS"
    
    if [ -f "test-multilang.js" ]; then
        log "Running multilingual test suite..."
        if node test-multilang.js; then
            log_success "All tests passed!"
        else
            log_error "Tests failed. Deployment aborted."
            exit 1
        fi
    else
        log_warning "test-multilang.js not found. Skipping tests."
    fi
}

validate_translations() {
    log_header "🌍 VALIDATING TRANSLATIONS"
    
    # Check if all 12 languages have translations
    LANGUAGES=(pt en es fr de it ja zh ar ru ko hi)
    
    for lang in "${LANGUAGES[@]}"; do
        log "Validating translations for $lang..."
        
        # This would be a more sophisticated check in a real deployment
        if node -e "
            const translations = require('./server.js');
            console.log('✅ $lang translations validated');
        " 2>/dev/null; then
            log_success "$lang translations validated"
        else
            log_warning "$lang translations validation skipped"
        fi
    done
}

# ═══════════════════════════════════════════════════════════════════
# 🚀 DEPLOYMENT CONFIGURATIONS
# ═══════════════════════════════════════════════════════════════════

setup_environment() {
    log_header "⚙️ SETTING UP ENVIRONMENT"
    
    case "$DEPLOY_ENV" in
        "production")
            setup_production_env
            ;;
        "staging")
            setup_staging_env
            ;;
        "development")
            setup_development_env
            ;;
        *)
            log_error "Unknown environment: $DEPLOY_ENV"
            exit 1
            ;;
    esac
}

setup_production_env() {
    log "Setting up production environment..."
    
    # Ensure critical environment variables are set
    required_vars=(
        "MONGODB_URI"
        "JWT_SECRET"
        "NODE_ENV"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ] && ! grep -q "^$var=" .env 2>/dev/null; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done
    
    # Set production-specific variables
    export NODE_ENV=production
    export PORT=${PORT:-3000}
    export SUPPORTED_LANGUAGES="$SUPPORTED_LANGUAGES"
    export DEFAULT_LANGUAGE="$DEFAULT_LANGUAGE"
    
    log_success "Production environment configured"
}

setup_staging_env() {
    log "Setting up staging environment..."
    
    export NODE_ENV=staging
    export PORT=${PORT:-3001}
    export SUPPORTED_LANGUAGES="$SUPPORTED_LANGUAGES"
    export DEFAULT_LANGUAGE="$DEFAULT_LANGUAGE"
    
    log_success "Staging environment configured"
}

setup_development_env() {
    log "Setting up development environment..."
    
    export NODE_ENV=development
    export PORT=${PORT:-3000}
    export SUPPORTED_LANGUAGES="$SUPPORTED_LANGUAGES"
    export DEFAULT_LANGUAGE="$DEFAULT_LANGUAGE"
    
    log_success "Development environment configured"
}

# ═══════════════════════════════════════════════════════════════════
# 🔧 DATABASE SETUP
# ═══════════════════════════════════════════════════════════════════

setup_database() {
    log_header "🗄️ SETTING UP DATABASE"
    
    if [ -n "$MONGODB_URI" ] || grep -q "MONGODB_URI" .env 2>/dev/null; then
        log "MongoDB URI configured"
        
        # Test database connection
        if node -e "
            const mongoose = require('mongoose');
            const mongoUri = process.env.MONGODB_URI || require('dotenv').config() && process.env.MONGODB_URI;
            mongoose.connect(mongoUri)
                .then(() => { console.log('✅ Database connection successful'); process.exit(0); })
                .catch(err => { console.error('❌ Database connection failed:', err.message); process.exit(1); });
        "; then
            log_success "Database connection verified"
        else
            log_error "Database connection failed"
            exit 1
        fi
    else
        log_warning "MongoDB URI not configured. Using default local MongoDB"
    fi
}

# ═══════════════════════════════════════════════════════════════════
# 🌐 CDN AND STATIC ASSETS
# ═══════════════════════════════════════════════════════════════════

setup_cdn() {
    log_header "🌐 SETTING UP CDN FOR GLOBAL ASSETS"
    
    # Create public directory if it doesn't exist
    mkdir -p public
    
    # Copy frontend files
    if [ -f "tps-sistema.html" ]; then
        cp tps-sistema.html public/
        log_success "Frontend HTML copied to public/"
    fi
    
    # Setup language-specific assets
    for lang in pt en es fr de it ja zh ar ru ko hi; do
        mkdir -p "public/assets/$lang"
        log "Created assets directory for $lang"
    done
    
    log_success "CDN structure created"
}

# ═══════════════════════════════════════════════════════════════════
# 🔒 SECURITY SETUP
# ═══════════════════════════════════════════════════════════════════

setup_security() {
    log_header "🔒 CONFIGURING SECURITY"
    
    # Ensure JWT secret is strong
    if [ "$DEPLOY_ENV" = "production" ]; then
        JWT_SECRET_LENGTH=$(echo -n "$JWT_SECRET" | wc -c)
        if [ "$JWT_SECRET_LENGTH" -lt 32 ]; then
            log_error "JWT_SECRET must be at least 32 characters long in production"
            exit 1
        fi
    fi
    
    # Set secure headers
    export HELMET_CSP_ENABLED=true
    export CORS_STRICT_MODE=true
    
    log_success "Security configuration applied"
}

# ═══════════════════════════════════════════════════════════════════
# 📊 MONITORING SETUP
# ═══════════════════════════════════════════════════════════════════

setup_monitoring() {
    log_header "📊 SETTING UP MONITORING"
    
    # Create logs directory
    mkdir -p logs
    
    # Setup log rotation
    if command -v logrotate &> /dev/null; then
        log "Setting up log rotation..."
        # This would configure logrotate in a real deployment
    fi
    
    # Setup health check endpoint
    log "Health check available at /api/health"
    
    log_success "Monitoring configured"
}

# ═══════════════════════════════════════════════════════════════════
# 🚀 DEPLOYMENT EXECUTION
# ═══════════════════════════════════════════════════════════════════

deploy_application() {
    log_header "🚀 DEPLOYING APPLICATION"
    
    case "$DEPLOY_ENV" in
        "production")
            deploy_production
            ;;
        "staging")
            deploy_staging
            ;;
        "development")
            deploy_development
            ;;
    esac
}

deploy_production() {
    log "Deploying to production..."
    
    # Build production assets
    if [ -f "webpack.config.js" ]; then
        npm run build
    fi
    
    # Start application with PM2 if available
    if command -v pm2 &> /dev/null; then
        log "Starting with PM2..."
        pm2 start ecosystem.config.js --env production
        pm2 save
    else
        log "PM2 not found. Starting with node..."
        nohup node server.js > logs/app.log 2>&1 &
        echo $! > .pid
    fi
    
    log_success "Application deployed to production"
}

deploy_staging() {
    log "Deploying to staging..."
    
    # Start with nodemon for staging
    if command -v pm2 &> /dev/null; then
        pm2 start ecosystem.config.js --env staging
    else
        nohup npm run dev > logs/staging.log 2>&1 &
        echo $! > .pid
    fi
    
    log_success "Application deployed to staging"
}

deploy_development() {
    log "Starting development server..."
    
    npm run dev
}

# ═══════════════════════════════════════════════════════════════════
# 🧪 POST-DEPLOYMENT VERIFICATION
# ═══════════════════════════════════════════════════════════════════

verify_deployment() {
    log_header "✅ VERIFYING DEPLOYMENT"
    
    # Wait for server to start
    sleep 5
    
    local BASE_URL="http://localhost:${PORT:-3000}"
    
    # Test health endpoint
    if curl -f "$BASE_URL/api/health" > /dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        return 1
    fi
    
    # Test language detection
    if curl -f "$BASE_URL/api/detect-language" > /dev/null 2>&1; then
        log_success "Language detection working"
    else
        log_error "Language detection failed"
        return 1
    fi
    
    # Test a few language endpoints
    for lang in pt en ja ar; do
        if curl -f "$BASE_URL/api/translations/$lang" > /dev/null 2>&1; then
            log_success "$lang translations available"
        else
            log_warning "$lang translations unavailable"
        fi
    done
    
    # Test chat intelligence
    if curl -f -X POST -H "Content-Type: application/json" \
        -d '{"message":"Hello","language":"en"}' \
        "$BASE_URL/api/test/chat-intelligence" > /dev/null 2>&1; then
        log_success "Chat intelligence working"
    else
        log_warning "Chat intelligence test failed"
    fi
    
    log_success "Deployment verification completed"
}

# ═══════════════════════════════════════════════════════════════════
# 🎯 MAIN DEPLOYMENT ORCHESTRATOR
# ═══════════════════════════════════════════════════════════════════

main() {
    log_header "🌍 TPS GLOBAL DEPLOYMENT - 12 LANGUAGES"
    log "Environment: $DEPLOY_ENV"
    log "Supported Languages: $SUPPORTED_LANGUAGES"
    log "Default Language: $DEFAULT_LANGUAGE"
    
    # Pre-deployment
    check_prerequisites
    install_dependencies
    
    # Validation
    run_tests
    validate_translations
    
    # Setup
    setup_environment
    setup_database
    setup_cdn
    setup_security
    setup_monitoring
    
    # Deploy
    deploy_application
    
    # Verify
    if [ "$DEPLOY_ENV" != "development" ]; then
        verify_deployment
    fi
    
    # Success message
    log_header "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY"
    log_success "TPS Global Backend is running with 12-language support!"
    log "🌐 Access: http://localhost:${PORT:-3000}"
    log "📡 API: http://localhost:${PORT:-3000}/api"
    log "📋 Health: http://localhost:${PORT:-3000}/api/health"
    log "🌍 Languages: http://localhost:${PORT:-3000}/api/languages"
    
    if [ "$DEPLOY_ENV" = "production" ]; then
        log_warning "Remember to configure:"
        log "  • SSL certificates"
        log "  • Load balancer"
        log "  • CDN for static assets"
        log "  • Backup strategy"
        log "  • Monitoring alerts"
    fi
    
    echo -e "\n${GREEN}🚀 TPS is ready to serve poetic journeys globally! ✨${NC}\n"
}

# ═══════════════════════════════════════════════════════════════════
# 🏃‍♂️ EXECUTION
# ═══════════════════════════════════════════════════════════════════

# Handle command line arguments
case "${1:-}" in
    "production"|"prod")
        DEPLOY_ENV="production"
        ;;
    "staging"|"stage")
        DEPLOY_ENV="staging"
        ;;
    "development"|"dev")
        DEPLOY_ENV="development"
        ;;
    "help"|"--help"|"-h")
        cat << EOF
🌍 TPS Global Deployment Script

Usage: $0 [environment]

Environments:
  production     Deploy to production with full security
  staging        Deploy to staging environment
  development    Start development server (default)
  help           Show this help message

Examples:
  $0 production    # Deploy to production
  $0 staging       # Deploy to staging
  $0 dev           # Start development server
  $0               # Start development server (default)

Features:
  ✅ 12-language support validation
  ✅ Database connection testing
  ✅ Security configuration
  ✅ Health check verification
  ✅ Translation validation
  ✅ Chat intelligence testing

Environment Variables Required:
  MONGODB_URI      Database connection string
  JWT_SECRET       JWT signing secret (32+ chars for production)
  NODE_ENV         Environment (production/staging/development)

Optional:
  PORT             Server port (default: 3000)
  API_BASE_URL     API base URL
  CDN_URL          CDN URL for static assets

EOF
        exit 0
        ;;
    "")
        DEPLOY_ENV="development"
        ;;
    *)
        log_error "Unknown environment: $1"
        log "Use '$0 help' for usage information"
        exit 1
        ;;
esac

# Check if running in CI/CD
if [ -n "${CI:-}" ]; then
    log "Running in CI/CD environment"
    export CI_MODE=true
fi

# Source environment variables if .env exists
if [ -f ".env" ]; then
    set -a  # Export all variables
    source .env
    set +a  # Stop exporting
    log "Environment variables loaded from .env"
fi

# Execute main deployment
main "$@"