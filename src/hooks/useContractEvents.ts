import { useEffect, useRef } from 'react';

export interface ContractEvent {
  type: 'RECORD_UPLOADED' | 'ACCESS_GRANTED' | 'ACCESS_REVOKED' | 'APPOINTMENT_BOOKED' | 'APPOINTMENT_COMPLETED' | 'REWARD_EARNED';
  timestamp: number;
  data: Record<string, unknown>;
}

export function useContractEvents(callback: (event: ContractEvent) => void) {
  const listenerRef = useRef<((e: StorageEvent) => void) | null>(null);

  useEffect(() => {
    // Cross-tab real-time event bridge using the localStorage Storage API.
    // When a contract action succeeds (add_record, grant_access, etc.) the
    // corresponding helper (createRecordUploadedEvent, etc.) writes a structured
    // event to localStorage keyed as 'medichain_event'.  The browser fires the
    // 'storage' DOM event in all *other* open tabs of the same origin, enabling
    // a live activity-feed without polling the blockchain on every render.
    //
    // Production upgrade path: replace this listener with a Soroban RPC
    // event subscription — `server.getEvents({ filters: [{ contractIds: [CONTRACT_ID] }] })`
    // — to receive on-chain contract events emitted by the Soroban runtime in
    // real time rather than relying on localStorage notifications.
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'medichain_event' && e.newValue) {
        try {
          const event = JSON.parse(e.newValue);
          callback(event);
          // Clean up after processing so the same event isn't replayed
          localStorage.removeItem('medichain_event');
        } catch (err) {
          console.error('Error parsing contract event:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    listenerRef.current = handleStorageChange;

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [callback]);

  return {
    emitEvent: (event: ContractEvent) => {
      localStorage.setItem('medichain_event', JSON.stringify(event));
      // Immediately call the callback for same-tab events
      callback(event);
    },
  };
}

export function createRecordUploadedEvent(recordName: string, recordType: string): ContractEvent {
  return {
    type: 'RECORD_UPLOADED',
    timestamp: Date.now(),
    data: {
      recordName,
      recordType,
      hash: `ipfs_${Date.now()}`,
    },
  };
}

export function createAccessGrantedEvent(doctorName: string, doctorAddr: string): ContractEvent {
  return {
    type: 'ACCESS_GRANTED',
    timestamp: Date.now(),
    data: {
      doctorName,
      doctorAddr,
    },
  };
}

export function createAccessRevokedEvent(doctorName: string, doctorAddr: string): ContractEvent {
  return {
    type: 'ACCESS_REVOKED',
    timestamp: Date.now(),
    data: {
      doctorName,
      doctorAddr,
    },
  };
}

export function createRewardEarnedEvent(amount: number, reason: string): ContractEvent {
  return {
    type: 'REWARD_EARNED',
    timestamp: Date.now(),
    data: {
      amount,
      reason,
    },
  };
}
