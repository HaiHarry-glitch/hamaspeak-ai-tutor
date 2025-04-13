
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import MethodDiagram from './MethodDiagram';

interface ConceptNode {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
  connections: string[];
}

const InteractiveDiagram = () => {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [showOriginalDiagram, setShowOriginalDiagram] = useState(false);
  
  const nodes: ConceptNode[] = [
    {
      id: 'concept-a',
      title: 'Concept A',
      description: 'Sử dụng những ngôn ngữ quen thuộc',
      x: 60,
      y: 20,
      connections: ['v-actives', 'concept-b']
    },
    {
      id: 'concept-b',
      title: 'Concept B',
      description: 'Suy nghĩ những câu nói diễn ra tiếp theo',
      x: 85,
      y: 20,
      connections: []
    },
    {
      id: 'v-actives',
      title: 'V-Actives',
      description: 'Suy nghĩ bằng tiếng Việt',
      x: 40,
      y: 40,
      connections: ['e-actives']
    },
    {
      id: 'e-actives',
      title: 'E-Actives',
      description: 'Suy nghĩ bằng tiếng Anh',
      x: 40,
      y: 60,
      connections: ['speaking', 'checking']
    },
    {
      id: 'checking',
      title: 'Checking',
      description: 'Kiểm tra xem những câu nói chính xác hay chưa',
      x: 15,
      y: 75,
      connections: ['v-actives']
    },
    {
      id: 'speaking',
      title: 'Speaking',
      description: 'Nói',
      x: 60,
      y: 70,
      connections: []
    },
    {
      id: 'delivery',
      title: 'Delivery',
      description: 'Truyền đạt cho đối phương',
      x: 75,
      y: 50,
      connections: []
    }
  ];
  
  const handleNodeClick = (nodeId: string) => {
    setActiveNode(activeNode === nodeId ? null : nodeId);
  };
  
  return (
    <div className="space-y-4">
      <Button 
        variant="outline"
        className="mx-auto block"
        onClick={() => setShowOriginalDiagram(!showOriginalDiagram)}
      >
        {showOriginalDiagram ? "Xem phiên bản tương tác" : "Xem hình ảnh gốc"}
      </Button>
      
      {showOriginalDiagram ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <MethodDiagram />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-[600px] border rounded-xl bg-white/80 backdrop-blur-sm p-4"
        >
          {/* Brain outline shape */}
          <svg 
            className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" 
            viewBox="0 0 100 100" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M30,20 Q45,10 60,20 Q75,30 70,50 Q65,70 50,80 Q35,70 30,50 Q25,30 30,20 Z" 
              fill="none" 
              stroke="#f97316" 
              strokeWidth="1" 
              strokeDasharray="3,3"
            />
          </svg>
          
          {/* Connections */}
          <svg 
            className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" 
            viewBox="0 0 100 100" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {nodes.map(node => 
              node.connections.map((targetId, idx) => {
                const target = nodes.find(n => n.id === targetId);
                if (!target) return null;
                
                return (
                  <path 
                    key={`${node.id}-${targetId}-${idx}`}
                    d={`M${node.x},${node.y} C${(node.x + target.x) / 2},${node.y} ${(node.x + target.x) / 2},${target.y} ${target.x},${target.y}`}
                    stroke={activeNode === node.id || activeNode === targetId ? "#f97316" : "#888"}
                    strokeWidth={activeNode === node.id || activeNode === targetId ? "2" : "1"}
                    strokeDasharray={activeNode === node.id || activeNode === targetId ? "none" : "3,3"}
                    fill="none"
                  />
                );
              })
            )}
          </svg>
          
          {/* Nodes */}
          {nodes.map(node => (
            <motion.div
              key={node.id}
              className={`absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNodeClick(node.id)}
            >
              <Card 
                className={`p-2 ${activeNode === node.id ? 'bg-gradient-to-r from-hamaspeak-blue to-hamaspeak-purple text-white' : 'bg-white'} transition-all duration-300 shadow-md hover:shadow-xl`}
              >
                <div className="text-center">
                  <h3 className="font-bold text-sm md:text-base">{node.title}</h3>
                  {activeNode === node.id && (
                    <motion.p 
                      className="text-xs md:text-sm mt-1" 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      {node.description}
                    </motion.p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
          
          {/* Explanation at the bottom */}
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="p-4 bg-white/90 border border-hamaspeak-purple/30">
              <p className="text-sm text-center">
                Nhấn vào các nút để xem chi tiết về từng phần của phương pháp Hamaspeak
              </p>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InteractiveDiagram;
