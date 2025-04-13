
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import BrainModel from './BrainModel';
import FloatingParticles from './FloatingParticles';

interface Scene3DProps {
  className?: string;
  orbitControls?: boolean;
  particles?: boolean;
  brain?: boolean;
  height?: string;
}

const Scene3D: React.FC<Scene3DProps> = ({ 
  className = "h-64", 
  orbitControls = false,
  particles = true,
  brain = true,
  height = "400px"
}) => {
  return (
    <div className={`${className} relative`} style={{ height }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          
          {brain && <BrainModel position={[0, 0, 0]} scale={1.5} />}
          {particles && <FloatingParticles count={100} />}
          
          {orbitControls && <OrbitControls enableZoom={false} enablePan={false} />}
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
