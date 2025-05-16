'use client';

import { useState } from 'react';
import Image from 'next/image';
import Navbar from '../components/Navbar';

export default function TestImagePage() {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  
  // Test URLs from different sources
  const testUrls = [
    // Replace these with your actual image URLs from your posts
    'https://example.com/placeholder.jpg',
    'https://picsum.photos/800/400', // Random image from Lorem Picsum
    'https://placehold.co/600x400', // Placeholder image
  ];
  
  const handleTestImage = async () => {
    if (!imageUrl) {
      setError('Please enter an image URL');
      return;
    }
    
    // Just set the URL - the Image component will try to load it
    console.log('Testing image URL:', imageUrl);
  };
  
  const handleInputChange = (e) => {
    setImageUrl(e.target.value);
    setError('');
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Image Loading Test</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <p>Enter a Vercel Blob URL to test:</p>
          <input 
            type="text" 
            value={imageUrl}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button 
            onClick={handleTestImage}
            style={{ padding: '8px 16px', marginRight: '10px' }}
          >
            Test Image
          </button>
          
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
        
        {/* Display the test image if URL is provided */}
        {imageUrl && (
          <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Next.js Image Component:</h3>
            <div>
              <Image 
                src={imageUrl}
                alt="Test image"
                width={600}
                height={400}
                style={{ maxWidth: '100%', height: 'auto' }}
                unoptimized={true}
              />
            </div>
            
            <h3>Regular IMG tag:</h3>
            <div>
              <img 
                src={imageUrl} 
                alt="Test image regular" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        )}
        
        <h2>Predefined Test Images</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {testUrls.map((url, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '10px' }}>
              <h3>Test Image {index + 1}</h3>
              <p style={{ fontSize: '12px', wordBreak: 'break-all' }}>{url}</p>
              
              <div style={{ marginBottom: '10px' }}>
                <button 
                  onClick={() => setImageUrl(url)}
                  style={{ padding: '4px 8px', fontSize: '14px' }}
                >
                  Use This URL
                </button>
              </div>
              
              <h4>Next.js Image:</h4>
              <Image 
                src={url}
                alt={`Test ${index + 1}`}
                width={300}
                height={200}
                style={{ maxWidth: '100%', height: 'auto' }}
                unoptimized={true}
              />
              
              <h4>Regular IMG:</h4>
              <img 
                src={url} 
                alt={`Test ${index + 1} regular`} 
                style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 