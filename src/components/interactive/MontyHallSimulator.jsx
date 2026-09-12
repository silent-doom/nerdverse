'use client';

import { useState } from 'react';
import styles from './InteractiveSimulation.module.css';
import Icon from '@/components/common/Icon';

export default function MontyHallSimulator() {
  const [carDoor, setCarDoor] = useState(Math.floor(Math.random() * 3));
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [revealedHostDoor, setRevealedHostDoor] = useState(null);
  const [gameState, setGameState] = useState('choose'); // 'choose', 'switch_or_stay', 'finished'
  const [result, setResult] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const [stats, setStats] = useState({
    stayWins: 14,
    stayTotal: 42,
    switchWins: 56,
    switchTotal: 84,
  });

  const handleDoorClick = (doorIndex) => {
    if (gameState === 'choose') {
      setSelectedDoor(doorIndex);
      const possibleHostDoors = [0, 1, 2].filter(
        (d) => d !== doorIndex && d !== carDoor
      );
      const hostPick = possibleHostDoors[Math.floor(Math.random() * possibleHostDoors.length)];
      setRevealedHostDoor(hostPick);
      setGameState('switch_or_stay');
    }
  };

  const handleFinalChoice = (isSwitch) => {
    const finalDoor = isSwitch
      ? [0, 1, 2].find((d) => d !== selectedDoor && d !== revealedHostDoor)
      : selectedDoor;

    const won = finalDoor === carDoor;
    setSelectedDoor(finalDoor);
    setResult(won ? 'win' : 'lose');
    setGameState('finished');

    if (isSwitch) {
      setStats((prev) => ({
        ...prev,
        switchWins: prev.switchWins + (won ? 1 : 0),
        switchTotal: prev.switchTotal + 1,
      }));
    } else {
      setStats((prev) => ({
        ...prev,
        stayWins: prev.stayWins + (won ? 1 : 0),
        stayTotal: prev.stayTotal + 1,
      }));
    }
  };

  const resetGame = () => {
    setCarDoor(Math.floor(Math.random() * 3));
    setSelectedDoor(null);
    setRevealedHostDoor(null);
    setGameState('choose');
    setResult(null);
  };

  const stayWinRate = stats.stayTotal > 0 ? ((stats.stayWins / stats.stayTotal) * 100).toFixed(1) : '0.0';
  const switchWinRate = stats.switchTotal > 0 ? ((stats.switchWins / stats.switchTotal) * 100).toFixed(1) : '0.0';

  return (
    <div className={styles.container}>
      <div className={styles.simHeader}>
        <div className={styles.simBadge}>
          <Icon name="math" size={13} color="var(--color-category-math)" />
          <span>Bayesian Probability Lab</span>
        </div>
        <h3 className={styles.simTitle}>Monty Hall Paradox Simulator</h3>
        <p className={styles.simSubtitle}>
          Behind one door is the grand prize; behind the other two are goats. Test why switching doors mathematically doubles your win probability from 33.3% to 66.7%.
        </p>
      </div>

      {/* Experiment Guide Card */}
      <div className={styles.instructionCard}>
        <div className={styles.instructionHeader}>
          <div className={styles.instructionTitle}>
            <Icon name="help-circle" size={14} />
            <span>Experiment Guide • How to Prove the Paradox</span>
          </div>
          <button
            type="button"
            className={styles.instructionToggle}
            onClick={() => setShowInstructions(!showInstructions)}
            title={showInstructions ? 'Minimize guide' : 'Expand guide'}
          >
            {showInstructions ? 'Hide' : 'Show'}
          </button>
        </div>

        {showInstructions && (
          <ul className={styles.instructionList}>
            <li>
              <span>1.</span>
              <span><strong>Initial Guess:</strong> Select any of the 3 doors. Your chance of picking the sports car is exactly <span className={styles.keyBadge}>1/3 (33.3%)</span>, leaving a <span className={styles.keyBadge}>2/3 (66.7%)</span> probability that the car is behind one of the unchosen doors.</span>
            </li>
            <li>
              <span>2.</span>
              <span><strong>Host's Action:</strong> Monty Hall—who knows where the car is—opens one of the unchosen doors to reveal a goat. Because he <em>never</em> opens the prize door, his action is an intelligent information filter.</span>
            </li>
            <li>
              <span>3.</span>
              <span><strong>Bayesian Transfer:</strong> All <span className={styles.keyBadge}>66.7%</span> of the unchosen probability mass transfers directly onto the <em>remaining unchosen door</em>.</span>
            </li>
            <li>
              <span>4.</span>
              <span><strong>Decision:</strong> Test <strong>Switch Doors</strong> vs <strong>Stay with Original</strong> across multiple rounds. Watch the empirical win counter converge to double odds for switching!</span>
            </li>
          </ul>
        )}
      </div>

      <div className={styles.doorsGrid}>
        {[0, 1, 2].map((idx) => {
          const isSelected = selectedDoor === idx;
          const isHostRevealed = revealedHostDoor === idx;
          const isFinished = gameState === 'finished';
          const isPrize = idx === carDoor;

          let icon = 'door';
          let statusLabel = '';
          if (isHostRevealed) {
            icon = 'alert';
            statusLabel = 'Host Revealed: Empty';
          }
          if (isFinished) {
            icon = isPrize ? 'trophy' : 'alert';
            statusLabel = isPrize ? 'Prize!' : 'Empty';
          }

          return (
            <button
              key={idx}
              onClick={() => handleDoorClick(idx)}
              disabled={gameState !== 'choose'}
              className={`${styles.doorCard} ${isSelected ? styles.doorSelected : ''} ${isHostRevealed ? styles.doorOpened : ''}`}
            >
              <div className={styles.doorIcon}>
                <Icon
                  name={icon}
                  size={36}
                  color={isFinished && isPrize ? 'var(--color-status-success)' : isSelected ? 'var(--color-brand-primary)' : 'currentColor'}
                />
              </div>
              <div className={styles.doorLabel}>Door {idx + 1}</div>
              {isSelected && !isFinished && (
                <span style={{ fontSize: '11px', color: 'var(--color-text-link)', fontWeight: 600 }}>Your Pick</span>
              )}
              {statusLabel && (
                <span style={{ fontSize: '11px', color: isPrize ? 'var(--color-status-success)' : 'var(--color-text-tertiary)' }}>
                  {statusLabel}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {gameState === 'switch_or_stay' && (
        <div style={{ textAlign: 'center', background: 'var(--color-bg-tertiary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--color-border-strong)' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#ffffff', fontWeight: 600 }}>
            Host reveals Door {revealedHostDoor + 1} is empty! Choose your final action:
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => handleFinalChoice(true)} className={styles.runButton}>
              <Icon name="refresh" size={16} />
              <span>Switch Doors (Theoretical 66.7%)</span>
            </button>
            <button
              onClick={() => handleFinalChoice(false)}
              className={styles.runButton}
              style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-border-strong)' }}
            >
              <span>Stay with Original (Theoretical 33.3%)</span>
            </button>
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div style={{ textAlign: 'center', background: 'var(--color-bg-tertiary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--color-border-strong)' }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '18px', color: result === 'win' ? 'var(--color-status-success)' : 'var(--color-status-danger)' }}>
            {result === 'win' ? 'Victory: Grand Prize Won' : 'Defeat: Empty Door Selected'}
          </h4>
          <button onClick={resetGame} className={styles.runButton}>
            <Icon name="refresh" size={16} />
            <span>Play Next Trial</span>
          </button>
        </div>
      )}

      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Staying Win Rate (Empirical)</div>
          <div className={styles.statValue}>{stayWinRate}%</div>
          <div className={styles.statFormula}>{stats.stayWins} wins / {stats.stayTotal} attempts</div>
        </div>

        <div className={`${styles.statCard} ${styles.highlightCard}`}>
          <div className={styles.statLabel}>Switching Win Rate (Empirical)</div>
          <div className={styles.statValueHighlight}>{switchWinRate}%</div>
          <div className={styles.statFormula}>{stats.switchWins} wins / {stats.switchTotal} attempts (2x Advantage)</div>
        </div>
      </div>
    </div>
  );
}
