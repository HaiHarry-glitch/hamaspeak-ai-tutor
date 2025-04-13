
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface BrainModelProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const BrainModel: React.FC<BrainModelProps> = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = 1 
}) => {
  const mesh = useRef<THREE.Mesh>(null);
  
  // Simple animation
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.005;
      mesh.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });
  
  return (
    <mesh 
      ref={mesh} 
      position={position as [number, number, number]} 
      rotation={rotation as [number, number, number]}
      scale={scale}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial 
        color="#9b87f5" 
        wireframe={true}
        emissive="#7E69AB"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

export default BrainModel;
