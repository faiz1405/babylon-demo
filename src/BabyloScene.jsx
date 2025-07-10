import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders';

const BabylonScene = () => {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Buat engine Babylon
    const engine = new BABYLON.Engine(canvasRef.current, true);

    // Buat scene dengan background putih
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(1, 1, 1); // Background putih

    // Buat camera dengan batasan pergerakan
    const camera = new BABYLON.ArcRotateCamera(
      'camera',
      0,
      Math.PI / 3,
      10,
      BABYLON.Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);
    
    // Batasi pergerakan camera
    camera.lowerBetaLimit = 0; // Tidak bisa ke bawah (minimum sudut vertikal)
    camera.upperBetaLimit = Math.PI / 2; // Maksimal sampai horizontal (90 derajat)
    
    // Disable zoom in, hanya allow zoom out
    camera.lowerRadiusLimit = 5; // Jarak minimum (tidak bisa zoom in lebih dekat)
    camera.upperRadiusLimit = 50; // Jarak maksimum zoom out

    // Buat ambient light yang lebih terang
    const ambientLight = new BABYLON.HemisphericLight(
      'ambientLight',
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    ambientLight.intensity = 1.5;

    // Cahaya dari DEPAN - diperkuat
    const frontLight = new BABYLON.DirectionalLight(
      'frontLight',
      new BABYLON.Vector3(0, 0, -1),
      scene
    );
    frontLight.intensity = 2.0;

    // Cahaya dari BELAKANG - diperkuat
    const backLight = new BABYLON.DirectionalLight(
      'backLight',
      new BABYLON.Vector3(0, 0, 1),
      scene
    );
    backLight.intensity = 2.0;

    // Cahaya dari KIRI - diperkuat
    const leftLight = new BABYLON.DirectionalLight(
      'leftLight',
      new BABYLON.Vector3(1, 0, 0),
      scene
    );
    leftLight.intensity = 1.5;

    // Cahaya dari KANAN - diperkuat
    const rightLight = new BABYLON.DirectionalLight(
      'rightLight',
      new BABYLON.Vector3(-1, 0, 0),
      scene
    );
    rightLight.intensity = 1.5;

    // Cahaya dari ATAS - diperkuat
    const topLight = new BABYLON.DirectionalLight(
      'topLight',
      new BABYLON.Vector3(0, -1, 0),
      scene
    );
    topLight.intensity = 2.0;

    // Tambahkan Point Light untuk pencahayaan tambahan
    const pointLight1 = new BABYLON.PointLight(
      'pointLight1',
      new BABYLON.Vector3(5, 5, 5),
      scene
    );
    pointLight1.intensity = 1.0;

    const pointLight2 = new BABYLON.PointLight(
      'pointLight2',
      new BABYLON.Vector3(-5, 5, -5),
      scene
    );
    pointLight2.intensity = 1.0;

    // Tambahkan Spot Light untuk highlight
    const spotLight1 = new BABYLON.SpotLight(
      'spotLight1',
      new BABYLON.Vector3(0, 10, 0),
      new BABYLON.Vector3(0, -1, 0),
      Math.PI / 3,
      2,
      scene
    );
    spotLight1.intensity = 1.5;

    // Muat model Suzuki Jimny
    BABYLON.SceneLoader.ImportMesh(
      '',
      '',
      'suzuki_jimny.glb',
      scene,
      (meshes) => {
        console.log('Model berhasil dimuat:', meshes);
        
        // Fokus camera ke model dan sesuaikan batasan zoom
        if (meshes.length > 0) {
          const boundingBox = meshes[0].getHierarchyBoundingVectors();
          const center = boundingBox.center;
          const size = boundingBox.max.subtract(boundingBox.min);
          const maxDim = Math.max(size.x, size.y, size.z);
          
          camera.target = center;
          camera.radius = maxDim * 3; // Posisi awal lebih jauh
          
          // Set jarak minimum yang aman - TIDAK ADA ZOOM IN
          camera.lowerRadiusLimit = maxDim * 2.5; // Minimum: 2.5x dari dimensi terbesar (sangat aman)
          camera.upperRadiusLimit = maxDim * 10; // Maksimum: 10x dari dimensi terbesar
          
          // Collision detection tidak diperlukan karena zoom in disabled
        }
        
        // Sembunyikan loading setelah model dimuat
        setIsLoading(false);
      },
      (progress) => {
        console.log('Loading progress:', progress);
        // Update progress loading
        if (progress.lengthComputable) {
          const percentComplete = (progress.loaded / progress.total) * 100;
          setLoadingProgress(Math.round(percentComplete));
        }
      },
      (error) => {
        console.error('Error loading model:', error);
        setIsLoading(false); // Sembunyikan loading meski ada error
      }
    );

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          outline: 'none',
          border: 'none'
        }}
      />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          fontFamily: 'Arial, sans-serif'
        }}>
          {/* Loading Spinner */}
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '20px'
          }}></div>
          
          {/* Loading Text */}
          <div style={{
            fontSize: '18px',
            color: '#333',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            Memuat Model Suzuki Jimny...
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '200px',
            height: '6px',
            backgroundColor: '#f0f0f0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${loadingProgress}%`,
              height: '100%',
              backgroundColor: '#3498db',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          
          {/* Progress Percentage */}
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginTop: '10px'
          }}>
            {loadingProgress}%
          </div>
        </div>
      )}
      
      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BabylonScene;
