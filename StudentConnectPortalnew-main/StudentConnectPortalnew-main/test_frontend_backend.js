import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test URLs
const LOCAL_BACKEND = 'http://localhost:8000';
const PRODUCTION_BACKEND = 'https://studentconnectportalnew.onrender.com';

async function testBackend(url, name) {
    console.log(`\n🔄 Testing ${name}...`);
    console.log(`URL: ${url}`);
    
    try {
        // Test health endpoint
        console.log('\n📊 Testing Health Endpoint...');
        const healthResponse = await fetch(`${url}/health`);
        
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health Check: Connected successfully');
            console.log(`📊 Database Status: ${healthData.database}`);
            console.log(`👥 Users in Database: ${healthData.user_count}`);
            console.log(`📁 Collections: ${healthData.collections.join(', ')}`);
            console.log(`🌐 MongoDB URL: ${healthData.mongodb_url}`);
        } else {
            console.log(`❌ Health Check: Failed (${healthResponse.status})`);
            const errorText = await healthResponse.text();
            console.log(`Error details: ${errorText}`);
        }
        
        // Test posts endpoint
        console.log('\n📝 Testing Posts Endpoint...');
        const postsResponse = await fetch(`${url}/posts`);
        
        if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            console.log('✅ Posts API: Connected successfully');
            console.log(`📝 Posts in Database: ${postsData.length}`);
            
            if (postsData.length > 0) {
                console.log('📋 Sample Post:');
                const samplePost = postsData[0];
                console.log(`  - Title: ${samplePost.title}`);
                console.log(`  - Author: ${samplePost.author_name}`);
                console.log(`  - Type: ${samplePost.type}`);
            }
        } else {
            console.log(`❌ Posts API: Failed (${postsResponse.status})`);
            const errorText = await postsResponse.text();
            console.log(`Error details: ${errorText}`);
        }
        
    } catch (error) {
        console.log(`❌ ${name} Connection Error: ${error.message}`);
    }
}

async function testFrontendConfiguration() {
    console.log('\n🔍 Checking Frontend Configuration...');
    
    // Check if there's a .env file
    const envFiles = [
        '.env',
        '.env.local',
        '.env.development',
        '.env.production'
    ];
    
    for (const envFile of envFiles) {
        if (fs.existsSync(envFile)) {
            console.log(`✅ Found environment file: ${envFile}`);
            const envContent = fs.readFileSync(envFile, 'utf8');
            const apiUrlMatch = envContent.match(/VITE_API_URL=(.+)/);
            if (apiUrlMatch) {
                console.log(`📡 API URL in ${envFile}: ${apiUrlMatch[1]}`);
                await testBackend(apiUrlMatch[1], `Frontend Configured Backend (${envFile})`);
            }
        }
    }
    
    // Check src/services/api.ts for default URL
    const apiServicePath = path.join('src', 'services', 'api.ts');
    if (fs.existsSync(apiServicePath)) {
        console.log(`✅ Found API service file: ${apiServicePath}`);
        const apiContent = fs.readFileSync(apiServicePath, 'utf8');
        const defaultUrlMatch = apiContent.match(/API_BASE_URL.*=.*['"`]([^'"`]+)['"`]/);
        if (defaultUrlMatch) {
            console.log(`📡 Default API URL: ${defaultUrlMatch[1]}`);
        }
    }
}

async function runAllTests() {
    console.log('🚀 Starting Frontend-Backend Connection Tests...\n');
    
    // Test local backend
    await testBackend(LOCAL_BACKEND, 'Local Backend (localhost:8000)');
    
    // Test production backend
    await testBackend(PRODUCTION_BACKEND, 'Production Backend (onrender.com)');
    
    // Test frontend configuration
    await testFrontendConfiguration();
    
    console.log('\n✅ All tests completed!');
    console.log('\n📋 Summary:');
    console.log('- If local backend tests pass: Your frontend can connect to local backend');
    console.log('- If production backend tests pass: Your frontend can connect to production backend');
    console.log('- Both use the same MongoDB database: studyconnect');
    console.log('- Database URL: mongodb+srv://admin:wbWR1zL8vNgWylMg@cluster0.nxklt.mongodb.net/studyconnect');
}

// Run the tests
runAllTests().catch(console.error); 