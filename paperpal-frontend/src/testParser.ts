import { DocumentParser } from './services/documentParser';

async function testParser() {
  const parser = new DocumentParser();
  console.log('✅ Parser ready');
  
  // Create a mock file for testing
  const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
  
  try {
    const result = await parser.parseDocument(mockFile);
    console.log('✅ Parse successful:', result);
  } catch (error) {
    console.error('❌ Parse failed:', error);
  }
}

testParser();