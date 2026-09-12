'use client';

import dynamic from 'next/dynamic';

const MurphysLaw3DPhysics = dynamic(() => import('@/components/3d/MurphysLaw3DPhysics'), { ssr: false });
const GrandfatherSpacetime3D = dynamic(() => import('@/components/3d/GrandfatherSpacetime3D'), { ssr: false });
const QuantumBlochSphere3D = dynamic(() => import('@/components/3d/QuantumBlochSphere3D'), { ssr: false });
const MontyHallSimulator = dynamic(() => import('./MontyHallSimulator'), { ssr: false });

export default function ConceptSimulatorResolver({ type }) {
  switch (type) {
    case 'MurphysLaw':
      return <MurphysLaw3DPhysics />;
    case 'GrandfatherParadox':
      return <GrandfatherSpacetime3D />;
    case 'SchrodingersCat':
      return <QuantumBlochSphere3D />;
    case 'MontyHall':
      return <MontyHallSimulator />;
    default:
      return null;
  }
}
