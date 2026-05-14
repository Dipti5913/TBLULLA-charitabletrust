import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { videoService } from '../lib/firebaseService';

const FirebaseDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFirebase = async () => {
    setLoading(true);
    setDebugInfo([]);
    
    try {
      addLog('Starting Firebase connection test...');
      
      // Test database initialization
      if (db) {
        addLog('✅ Firebase database is initialized');
      } else {
        addLog('❌ Firebase database is NOT initialized');
        setLoading(false);
        return;
      }

      // Test video service
      addLog('Testing video service...');
      const videos = await videoService.getActive();
      addLog(`📹 Video service returned ${videos.length} videos`);
      
      if (videos.length > 0) {
        const firstVideo = videos[0];
        addLog(`First video: ${firstVideo.title} (ID: ${firstVideo.id})`);
        addLog(`Sample data: ${firstVideo.id?.startsWith('sample-') ? 'YES' : 'NO'}`);
      }

      addLog('✅ Firebase test completed successfully');
    } catch (error: any) {
      addLog(`❌ Firebase test failed: ${error.message}`);
      console.error('Firebase test error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testFirebase();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #ccc', 
      padding: '15px', 
      borderRadius: '8px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        Firebase Debug Panel
        <button 
          onClick={testFirebase} 
          disabled={loading}
          style={{ marginLeft: '10px', padding: '2px 8px' }}
        >
          {loading ? 'Testing...' : 'Retest'}
        </button>
      </div>
      <div>
        {debugInfo.map((log, index) => (
          <div key={index} style={{ marginBottom: '2px' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FirebaseDebug;
