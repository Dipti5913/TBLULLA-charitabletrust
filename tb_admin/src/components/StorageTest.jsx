import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

const StorageTest = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState('');
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setDownloadURL('');
      console.log('STORAGE TEST: File selected:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      });
    }
  };

  const testUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!storage) {
      setError('Firebase Storage not initialized');
      console.error('STORAGE TEST: Storage not available:', storage);
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');
    setDownloadURL('');

    try {
      console.log('STORAGE TEST: Starting upload...');
      console.log('STORAGE TEST: Storage instance:', storage);
      
      const fileName = `test_${uuidv4()}_${file.name}`;
      const storagePath = `projects/${fileName}`;
      
      console.log('STORAGE TEST: Storage path:', storagePath);
      
      const storageRef = ref(storage, storagePath);
      console.log('STORAGE TEST: Storage reference created:', storageRef);
      
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressPercent);
          console.log('STORAGE TEST: Upload progress:', progressPercent + '%');
        },
        (error) => {
          console.error('STORAGE TEST: Upload error:', {
            error: error,
            code: error.code,
            message: error.message,
            serverResponse: error.serverResponse
          });
          setError(`Upload failed: ${error.code} - ${error.message}`);
          setUploading(false);
        },
        async () => {
          try {
            console.log('STORAGE TEST: Upload completed, getting download URL...');
            const url = await getDownloadURL(storageRef);
            console.log('STORAGE TEST: Download URL obtained:', url);
            setDownloadURL(url);
            setUploading(false);
          } catch (urlError) {
            console.error('STORAGE TEST: Error getting download URL:', urlError);
            setError(`Failed to get download URL: ${urlError.message}`);
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('STORAGE TEST: Setup error:', error);
      setError(`Setup error: ${error.message}`);
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px', borderRadius: '8px' }}>
      <h3>Firebase Storage Test</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Storage Status:</strong> {storage ? '✅ Connected' : '❌ Not Connected'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <input 
          type="file" 
          onChange={handleFileSelect}
          accept="image/*"
          disabled={uploading}
        />
      </div>
      
      {file && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Selected File:</strong> {file.name} ({Math.round(file.size / 1024)}KB)
        </div>
      )}
      
      <button 
        onClick={testUpload}
        disabled={!file || uploading}
        style={{
          padding: '10px 20px',
          backgroundColor: uploading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: uploading ? 'not-allowed' : 'pointer'
        }}
      >
        {uploading ? `Uploading... ${Math.round(progress)}%` : 'Test Upload'}
      </button>
      
      {progress > 0 && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ 
            width: '100%', 
            backgroundColor: '#f0f0f0', 
            borderRadius: '4px',
            height: '20px'
          }}>
            <div style={{
              width: `${progress}%`,
              backgroundColor: '#007bff',
              height: '100%',
              borderRadius: '4px',
              transition: 'width 0.3s'
            }}></div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '5px' }}>
            {Math.round(progress)}%
          </div>
        </div>
      )}
      
      {error && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '4px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {downloadURL && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          color: '#155724',
          borderRadius: '4px'
        }}>
          <strong>Success!</strong> File uploaded successfully.
          <br />
          <a href={downloadURL} target="_blank" rel="noopener noreferrer">
            View uploaded file
          </a>
          <br />
          <small>URL: {downloadURL}</small>
        </div>
      )}
    </div>
  );
};

export default StorageTest;