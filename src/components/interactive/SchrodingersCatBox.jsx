import { useState, useEffect } from 'react';
import styles from './SchrodingersCatBox.module.css';
import Button from '@/components/ui/Button/Button';
import Icon from '@/components/common/Icon';

export default function SchrodingersCatBox() {
  const [boxState, setBoxState] = useState('closed'); // 'closed', 'opening', 'alive', 'dead'
  const [isShaking, setIsShaking] = useState(false);

  // Random shake effect when closed
  useEffect(() => {
    if (boxState !== 'closed') return;
    
    const shakeInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    }, 2000);
    
    return () => clearInterval(shakeInterval);
  }, [boxState]);

  const handleOpenBox = () => {
    setBoxState('opening');
    
    // Simulate measurement collapse
    setTimeout(() => {
      const isAlive = Math.random() > 0.5;
      setBoxState(isAlive ? 'alive' : 'dead');
    }, 1000);
  };

  const handleReset = () => {
    setBoxState('closed');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>The Box</h3>
        <p className={styles.status}>
          Status: {
            boxState === 'closed' ? <span className={styles.superposition}>SUPERPOSITION (Alive + Dead)</span> :
            boxState === 'opening' ? <span className={styles.measuring}>MEASURING...</span> :
            boxState === 'alive' ? <span className={styles.alive}>ALIVE</span> :
            <span className={styles.dead}>DEAD</span>
          }
        </p>
      </div>
      
      <div className={styles.simulationArea}>
        <div className={`${styles.boxContainer} ${isShaking ? styles.shake : ''} ${boxState !== 'closed' ? styles.boxOpen : ''}`}>
          
          {/* The Cat (Hidden when box is closed) */}
          <div className={`${styles.cat} ${boxState === 'alive' ? styles.catAlive : boxState === 'dead' ? styles.catDead : ''}`}>
            {boxState === 'alive' && (
              <svg viewBox="0 0 100 100" className={styles.catSvg}>
                <circle cx="50" cy="50" r="40" fill="var(--color-accent-gold)" stroke="var(--color-border-default)" strokeWidth="4" />
                <polygon points="10,20 35,25 25,50" fill="var(--color-accent-gold)" stroke="var(--color-border-default)" strokeWidth="4" />
                <polygon points="90,20 65,25 75,50" fill="var(--color-accent-gold)" stroke="var(--color-border-default)" strokeWidth="4" />
                <circle cx="35" cy="45" r="5" fill="var(--color-border-default)" />
                <circle cx="65" cy="45" r="5" fill="var(--color-border-default)" />
                <path d="M40 60 Q 50 70 60 60" fill="none" stroke="var(--color-border-default)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            {boxState === 'dead' && (
              <svg viewBox="0 0 100 100" className={styles.catSvg}>
                <circle cx="50" cy="50" r="40" fill="var(--color-bg-tertiary)" stroke="var(--color-border-default)" strokeWidth="4" strokeDasharray="5,5" />
                <polygon points="10,20 35,25 25,50" fill="var(--color-bg-tertiary)" stroke="var(--color-border-default)" strokeWidth="4" strokeDasharray="5,5" />
                <polygon points="90,20 65,25 75,50" fill="var(--color-bg-tertiary)" stroke="var(--color-border-default)" strokeWidth="4" strokeDasharray="5,5" />
                <line x1="30" y1="40" x2="40" y2="50" stroke="var(--color-border-default)" strokeWidth="4" />
                <line x1="40" y1="40" x2="30" y2="50" stroke="var(--color-border-default)" strokeWidth="4" />
                <line x1="60" y1="40" x2="70" y2="50" stroke="var(--color-border-default)" strokeWidth="4" />
                <line x1="70" y1="40" x2="60" y2="50" stroke="var(--color-border-default)" strokeWidth="4" />
                <path d="M40 65 Q 50 60 60 65" fill="none" stroke="var(--color-border-default)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
          </div>

          {/* The Box Front */}
          <div className={styles.boxLid} />
          <div className={styles.boxFront}>
            <span className={styles.radioactiveSymbol}>☢️</span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        {boxState === 'closed' ? (
          <Button size="lg" variant="primary" onClick={handleOpenBox}>
            <Icon name="eye" size={16} />
            <span>Open Box (Measure)</span>
          </Button>
        ) : (
          <Button size="lg" variant="secondary" onClick={handleReset} disabled={boxState === 'opening'}>
            <Icon name="rotate-ccw" size={16} />
            <span>Reset Experiment</span>
          </Button>
        )}
      </div>

      <div className={styles.explanation}>
        <h4 className={styles.explanationTitle}>The Pedagogical Takeaway:</h4>
        <p>
          Before you open the box, the system is in a state of <strong>superposition</strong>. We don't know the state, and mathematically, it exists as a probability of both outcomes simultaneously. The act of <em>observing</em> (opening the box) forces the universe to "collapse" into one definite state.
        </p>
      </div>
    </div>
  );
}
