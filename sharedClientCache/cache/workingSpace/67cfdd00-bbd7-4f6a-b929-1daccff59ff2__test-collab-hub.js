/**
 * Test script for the collaboration hub
 * Verifies that the server and WebSocket functionality work correctly
 */

import { WebSocket } from 'ws';
import http from 'http';

console.log('🧪 Testing Collaboration Hub Functionality...\n');

// Test 1: Check if server can start without errors
console.log('Test 1: Checking if server module loads correctly...');
try {
  const { app, server, messages } = await import('./collab-hub-server.js');
  console.log('✅ Server module loaded successfully');
  
  // Create a test HTTP request to the API
  console.log('Test 2: Testing REST API endpoints...');
  
  // Test the API endpoints by making a request
  const testApiRequest = (endpoint) => {
    return new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:4000${endpoint}`, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            console.log(`✅ ${endpoint} returned valid JSON`);
            resolve(parsed);
          } catch (e) {
            console.error(`❌ ${endpoint} returned invalid JSON:`, data);
            reject(e);
          }
        });
      }).on('error', (err) => {
        console.error(`❌ Error requesting ${endpoint}:`, err.message);
        reject(err);
      });
    });
  };
  
  // Wait a moment for server to start
  setTimeout(async () => {
    try {
      // Test the messages API
      await testApiRequest('/api/messages');
      await testApiRequest('/api/messages/vsCode');
      await testApiRequest('/api/messages/lmArena');
      
      console.log('\nTest 3: Testing WebSocket connection...');
      
      // Test WebSocket connection
      const ws = new WebSocket('ws://localhost:4000/ws');
      
      ws.on('open', () => {
        console.log('✅ WebSocket connection established');
        
        // Send a test message
        const testMessage = {
          platform: 'vsCode',
          sender: 'TestClient',
          content: 'Hello from test client!'
        };
        
        ws.send(JSON.stringify(testMessage));
        console.log('✅ Test message sent to server');
      });
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'init') {
            console.log('✅ Received initialization message from server');
            console.log('✅ All tests passed! Collaboration hub is working correctly.');
            
            // Close the WebSocket connection
            ws.close();
            
            // Close the server
            server.close(() => {
              console.log('\n🏁 All tests completed successfully!');
            });
          }
        } catch (e) {
          console.error('❌ Error parsing WebSocket message:', e);
        }
      });
      
      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
      });
      
      // Set timeout to close if no response after 5 seconds
      setTimeout(() => {
        console.log('⚠️  WebSocket test timed out after 5 seconds');
        ws.close();
        server.close();
      }, 5000);
      
    } catch (error) {
      console.error('❌ API tests failed:', error);
      server.close();
    }
  }, 1000); // Wait 1 second for server to start
  
} catch (error) {
  console.error('❌ Failed to load server module:', error.message);
}