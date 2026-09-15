'use client';

import dynamic from 'next/dynamic';

const MurphysLaw3DPhysics = dynamic(() => import('@/components/3d/MurphysLaw3DPhysics'), { ssr: false });
const GrandfatherSpacetime3D = dynamic(() => import('@/components/3d/GrandfatherSpacetime3D'), { ssr: false });
const SchrodingersCat3DLab = dynamic(() => import('@/components/3d/SchrodingersCat3DLab'), { ssr: false });
const MontyHall3DLab = dynamic(() => import('@/components/3d/MontyHall3DLab'), { ssr: false });
const TrolleyProblem3DLab = dynamic(() => import('@/components/3d/TrolleyProblem3DLab'), { ssr: false });
const BayesTheorem3DLab = dynamic(() => import('@/components/3d/BayesTheorem3DLab'), { ssr: false });
const SimpsonsParadox3DLab = dynamic(() => import('@/components/3d/SimpsonsParadox3DLab'), { ssr: false });
const StPetersburg3DLab = dynamic(() => import('@/components/3d/StPetersburg3DLab'), { ssr: false });
const MaxwellsDemon3DLab = dynamic(() => import('@/components/3d/MaxwellsDemon3DLab'), { ssr: false });
const FermiParadox3DLab = dynamic(() => import('@/components/3d/FermiParadox3DLab'), { ssr: false });
const LaplacesDemon3DLab = dynamic(() => import('@/components/3d/LaplacesDemon3DLab'), { ssr: false });
const ShipOfTheseus3DLab = dynamic(() => import('@/components/3d/ShipOfTheseus3DLab'), { ssr: false });
const CognitiveDissonance3DLab = dynamic(() => import('@/components/3d/CognitiveDissonance3DLab'), { ssr: false });
const HaltingProblem3DLab = dynamic(() => import('@/components/3d/HaltingProblem3DLab'), { ssr: false });
const ConwaysGameOfLife3DLab = dynamic(() => import('@/components/3d/ConwaysGameOfLife3DLab'), { ssr: false });
const ChineseRoom3DLab = dynamic(() => import('@/components/3d/ChineseRoom3DLab'), { ssr: false });
const RedQueen3DLab = dynamic(() => import('@/components/3d/RedQueen3DLab'), { ssr: false });
const PrisonersDilemma3DLab = dynamic(() => import('@/components/3d/PrisonersDilemma3DLab'), { ssr: false });
const TragedyOfCommons3DLab = dynamic(() => import('@/components/3d/TragedyOfCommons3DLab'), { ssr: false });
const BraessParadox3DLab = dynamic(() => import('@/components/3d/BraessParadox3DLab'), { ssr: false });

export default function ConceptSimulatorResolver({ type }) {
  switch (type) {
    case 'MurphysLaw':
      return <MurphysLaw3DPhysics />;
    case 'GrandfatherParadox':
      return <GrandfatherSpacetime3D />;
    case 'SchrodingersCat':
      return <SchrodingersCat3DLab />;
    case 'MontyHall':
      return <MontyHall3DLab />;
    case 'TrolleyProblem':
      return <TrolleyProblem3DLab />;
    case 'BayesTheorem':
      return <BayesTheorem3DLab />;
    case 'SimpsonsParadox':
      return <SimpsonsParadox3DLab />;
    case 'StPetersburg':
      return <StPetersburg3DLab />;
    case 'MaxwellsDemon':
      return <MaxwellsDemon3DLab />;
    case 'FermiParadox':
      return <FermiParadox3DLab />;
    case 'LaplacesDemon':
      return <LaplacesDemon3DLab />;
    case 'ShipOfTheseus':
      return <ShipOfTheseus3DLab />;
    case 'CognitiveDissonance':
      return <CognitiveDissonance3DLab />;
    case 'HaltingProblem':
      return <HaltingProblem3DLab />;
    case 'ConwaysGameOfLife':
      return <ConwaysGameOfLife3DLab />;
    case 'ChineseRoom':
      return <ChineseRoom3DLab />;
    case 'RedQueen':
      return <RedQueen3DLab />;
    case 'PrisonersDilemma':
      return <PrisonersDilemma3DLab />;
    case 'TragedyOfCommons':
      return <TragedyOfCommons3DLab />;
    case 'BraessParadox':
      return <BraessParadox3DLab />;
    default:
      return null;
  }
}
