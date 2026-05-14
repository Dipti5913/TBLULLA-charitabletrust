import React, { useState } from 'react';

const ImageDebugger: React.FC = () => {
  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<string>('');

  const testImageUrl = async (url: string) => {
    if (!url) {
      setTestResult('❌ No URL provided');
      return;
    }

    setTestResult('🔄 Testing...');
    
    try {
      console.log('ImageDebugger: Testing URL:', url);
      
      // Test 1: URL format validation
      if (!url.startsWith('http')) {
        setTestResult(`❌ Invalid URL format!\nURL: ${url}\nMust start with http:// or https://`);
        return;
      }
      
      // Test 2: Fetch test
      console.log('ImageDebugger: Testing fetch...');
      const response = await fetch(url, { method: 'HEAD' });
      console.log('ImageDebugger: Fetch result:', response.status, response.ok);
      
      // Test 3: Image load test
      console.log('ImageDebugger: Testing image load...');
      const img = new Image();
      // Don't set crossOrigin to avoid CORS issues
      
      img.onload = () => {
        console.log('ImageDebugger: Image loaded successfully');
        setTestResult(`✅ Image accessible!\nStatus: ${response.status}\nSize: ${img.naturalWidth}x${img.naturalHeight}\nURL: ${url}`);
      };
      
      img.onerror = (e) => {
        console.error('ImageDebugger: Image load failed:', e);
        setTestResult(`❌ Image load failed!\nFetch status: ${response.status}\nFetch OK: ${response.ok}\nPossible CORS issue\nURL: ${url}`);
      };
      
      img.src = url;
      
    } catch (error) {
      console.error('ImageDebugger: Network error:', error);
      setTestResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}\nURL: ${url}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 border rounded-lg shadow-lg max-w-sm">
      <h3 className="font-bold mb-2">🔍 Image URL Debugger</h3>
      <input
        type="text"
        placeholder="Paste image URL here..."
        value={testUrl}
        onChange={(e) => setTestUrl(e.target.value)}
        className="w-full p-2 border rounded mb-2 text-xs"
      />
      <button
        onClick={() => testImageUrl(testUrl)}
        className="w-full bg-blue-500 text-white p-2 rounded text-sm mb-2"
      >
        Test URL
      </button>
      <div className="text-xs whitespace-pre-line bg-gray-100 p-2 rounded">
        {testResult || 'Enter URL and click Test'}
      </div>
    </div>
  );
};

export default ImageDebugger;
