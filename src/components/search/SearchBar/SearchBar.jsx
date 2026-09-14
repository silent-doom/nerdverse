'use client';

import React from 'react';
import Icon from '@/components/common/Icon';

export default function SearchBar({ onOpen, placeholder = 'Search all 19 concepts (⌘K)...' }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '8px',
        padding: '8px 14px',
        color: '#94a3b8',
        fontSize: '13px',
        cursor: 'pointer',
        width: '100%',
        maxWidth: '320px',
        transition: 'all 0.2s ease',
      }}
      aria-label="Open concept search"
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <Icon name="search" size={15} color="#38bdf8" />
        <span>{placeholder}</span>
      </span>
      <kbd
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '10px',
          fontFamily: 'monospace',
          color: '#cbd5e1',
        }}
      >
        ⌘K
      </kbd>
    </button>
  );
}
