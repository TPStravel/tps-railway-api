#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════════════
// 🚀 TPS SETUP AUTOMÁTICO - The Poetic Suitcase
// ═══════════════════════════════════════════════════════════════════
// Script para configuração inicial completa do TPS Backend
// Executa: node setup.js
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('═══════════════════════════════════════════════════════════');
console.log('🏗️  TPS SETUP AUTOMÁTICO - The Poetic Suitcase');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// ═══════════════════════════════════════════════════════════════════
// 🎯 CONFIGURAÇÕES INICIAIS
// ═══════════════════════════════════════════════════════════════════

const projectConfig = {
    name: 'tps-backend',
    version: '1.0.0',
    port: 3000,
    description: 'TPS - The Poetic Suitcase Backend API'
};

// ═══════════════════════════════════════════════════════════════════
// 🛠️ FUNÇÕES UTILITÁRIAS
// ═══════════════════════════════════════════════════════════════════

function createDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 Criado: ${dirPath}`);
    } else {
        console.log(`✅ Existe: ${dirPath}`);
    }
}

function createFile(filePath, content) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
        console.log(`📄 Criado: ${filePath}`);
    } else {
        console.log(`✅ Existe: ${filePath}`);
    }
}

function runCommand(command, description) {
    try {
        console.log(`🔧 ${description}...`);
        execSync(command, { stdio: 'pipe' });
        console.log(`✅ ${description} - Concluído`);
    } catch (error) {
        console.log(`⚠️  ${description} - Erro (continuando...)`);
    }
}

function checkPrerequisites() {
    console.log('🔍 Verificando pré-requisitos...');
    
    try {
        // Check Node.js
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        console.log(`✅ Node.js: ${nodeVersion}`);
        
        // Check npm
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        console.log(`✅ npm: ${npmVersion}`);
        
        // Check MongoDB
        try {
            execSync('mongod --version', { stdio: 'pipe' });
            console.log(`✅ MongoDB: Instalado`);
        } catch {
            console.log(`⚠️  MongoDB: Não encontrado (será necessário instalar)`);
        }
        
    } catch (error) {
        console.log(`❌ Erro na verificação de pré-requisitos:`, error.message);
        process.exit(1);
    }
    
    console.log('');
}

// ═══════════════════════════════════════════════════════════════════
// 📁 ESTRUTURA DE PASTAS
// ═══════════════════════════════════════════════════════════════════

function createProjectStructure() {
    console.log('📁 Criando estrutura de pastas...');
    
    const directories = [
        'public',
        'routes',
        'models', 
        'middleware',
        'utils',
        'tests',
        'logs',
        'scripts',
        'config',
        'uploads',
        'templates'
    ];
    
    directories.forEach(dir => createDirectory(dir));
    console.log('');
}

// ═══════════════════════════════════════════════════════════════════
// 📄 ARQUIVOS DE CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════

function createConfigFiles() {
    console.log('📄 Criando arquivos de configuração...');
    
    // .gitignore
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output/

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Uploads
uploads/*
!uploads/.gitkeep

# Database
data/
*.db
*.sqlite

# Build files
dist/
build/
`;
    
    createFile('.gitignore', gitignoreContent);
    
    // .env (cópia do .env.example)
    if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
        fs.copyFileSync('.env.example', '.env');
        console.log('📄 Criado: .env (baseado no .env.example)');
    }
    
    // nodemon.json
    const nodemonConfig = {
        "watch": ["server.js", "routes/", "models/", "middleware/", "utils/"],
        "ext": "js,json",
        "ignore": ["node_modules/", "logs/", "uploads/", "tests/"],
        "env": {
            "NODE_ENV": "development"
        },
        "delay": "1000"
    };
    
    createFile('nodemon.json', JSON.stringify(nodemonConfig, null, 2));
    
    // .eslintrc.json
    const eslintConfig = {
        "env": {
            "node": true,
            "es2021": true,
            "jest": true
        },
        "extends": ["eslint:recommended"],
        "parserOptions": {
            "ecmaVersion": 12,
            "sourceType": "module"
        },
        "rules": {
            "no-console": "off",
            "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
            "prefer-const": "error",
            "no-var": "error"
        }
    };
    
    createFile('.eslintrc.json', JSON.stringify(eslintConfig, null, 2));
    
    console.log('');
}

// ═══════════════════════════════════════════════════════════════════
// 📦 INSTALAÇÃO DE DEPENDÊNCIAS
// ═══════════════════════════════════════════════════════════════════

function installDependencies() {
    console.log('📦 Instalando dependências...');
    console.log('   (Isso pode levar alguns minutos)');
    console.log('');
    
    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
        console.log('❌ package.json não encontrado!');
        console.log('   Certifique-se de ter o arquivo package.json no diretório.');
        return;
    }
    
    // Install dependencies
    runCommand('npm install', 'Instalando dependências do npm');
    console.log('');
}

// ═══════════════════════════════════════════════════════════════════
// 🗄️ CONFIGURAÇÃO DO BANCO DE DADOS
// ═══════════════════════════════════════════════════════════════════

function setupDatabase() {
    console.log('🗄️  Configurando banco de dados...');
    
    // Database setup script
    const dbSetupScript = `const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tps-luxury';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('🗄️  MongoDB conectado com sucesso');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro de conexão MongoDB:', error);
        process.exit(1);
    }
};

connectDB();
`;
    
    createFile('scripts/test-db.js', dbSetupScript);
    
    // Test database connection
    try {
        runCommand('node scripts/test-db.js', 'Testando conexão com banco de dados');
    } catch (error) {
        console.log('⚠️  Conexão com MongoDB não disponível no momento');
        console.log('   Configure MONGODB_URI no arquivo .env');
    }
    
    console.log('');
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 SCRIPTS DE INICIALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════

function createStartupScripts() {
    console.log('🚀 Criando scripts de inicialização...');
    
    // Start script
    const startScript = `#!/bin/bash
echo "🚀 Iniciando TPS Backend..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "   Copie .env.example para .env e configure as variáveis"
    exit 1
fi

# Start MongoDB if not running
if ! pgrep -x "mongod" > /dev/null; then
    echo "🗄️  Iniciando MongoDB..."
    mongod --fork --logpath /tmp/mongod.log --dbpath ./data/db
fi

# Start the server
echo "🌟 Iniciando servidor TPS..."
npm run dev
`;
    
    createFile('scripts/start.sh', startScript);
    
    // Make it executable
    try {
        execSync('chmod +x scripts/start.sh', { stdio: 'pipe' });
    } catch (error) {
        // Ignore on Windows
    }
    
    // Development setup script
    const devScript = `#!/bin/bash
echo "🔧 Setup de Desenvolvimento TPS"
echo ""

# Install development tools globally
echo "📦 Instalando ferramentas de desenvolvimento..."
npm install -g nodemon eslint prettier

# Create data directory for MongoDB
mkdir -p data/db

# Create uploads directory
mkdir -p uploads
echo "" > uploads/.gitkeep

# Set up git hooks (if git repo exists)
if [ -d ".git" ]; then
    echo "🔧 Configurando git hooks..."
    echo "npm run lint" > .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
fi

echo "✅ Setup de desenvolvimento concluído!"
`;
    
    createFile('scripts/dev-setup.sh', devScript);
    
    try {
        execSync('chmod +x scripts/dev-setup.sh', { stdio: 'pipe' });
    } catch (error) {
        // Ignore on Windows
    }
    
    console.log('');
}

// ═══════════════════════════════════════════════════════════════════
// 📋 INSTRUÇÕES FINAIS
// ═══════════════════════════════════════════════════════════════════

function showFinalInstructions() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 SETUP TPS CONCLUÍDO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('');
    console.log('1. 🔧 Configure o arquivo .env:');
    console.log('   • Edite .env com suas configurações');
    console.log('   • Configure MONGODB_URI, JWT_SECRET, etc.');
    console.log('');
    console.log('2. 🗄️  Configure o MongoDB:');
    console.log('   • Local: mongod --dbpath ./data/db');
    console.log('   • Atlas: Configure MONGODB_URI no .env');
    console.log('');
    console.log('3. 🚀 Inicie o servidor:');
    console.log('   npm run dev');
    console.log('');
    console.log('4. 🌐 Acesse a aplicação:');
    console.log('   • Frontend: http://localhost:3000');
    console.log('   • API: http://localhost:3000/api');
    console.log('');
    console.log('📚 COMANDOS ÚTEIS:');
    console.log('   npm start        # Produção');
    console.log('   npm run dev      # Desenvolvimento');  
    console.log('   npm test         # Testes');
    console.log('   npm run lint     # Linting');
    console.log('   npm run seed     # Popular dados');
    console.log('');
    console.log('🔗 ENDPOINTS PRINCIPAIS:');
    console.log('   POST /api/auth/register');
    console.log('   POST /api/chat/message');
    console.log('   POST /api/bookings');
    console.log('   GET  /api/stats');
    console.log('');
    console.log('📖 DOCUMENTAÇÃO:');
    console.log('   Consulte README.md para detalhes completos');
    console.log('');
    console.log('🎯 TPS Backend está pronto para servir jornadas poéticas!');
    console.log('═══════════════════════════════════════════════════════════');
}

// ═══════════════════════════════════════════════════════════════════
// 🏃‍♂️ EXECUÇÃO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

async function main() {
    try {
        console.log('🎯 Iniciando setup automático do TPS Backend...');
        console.log('');
        
        // 1. Check prerequisites
        checkPrerequisites();
        
        // 2. Create project structure
        createProjectStructure();
        
        // 3. Create config files
        createConfigFiles();
        
        // 4. Install dependencies
        installDependencies();
        
        // 5. Setup database
        setupDatabase();
        
        // 6. Create startup scripts
        createStartupScripts();
        
        // 7. Show final instructions
        showFinalInstructions();
        
    } catch (error) {
        console.error('❌ Erro durante o setup:', error);
        process.exit(1);
    }
}

// Run the setup
if (require.main === module) {
    main();
}

module.exports = { main };