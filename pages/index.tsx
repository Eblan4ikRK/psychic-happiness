// /pages/index.tsx
import { useEffect, useState } from 'react';

export default function Home() {
  const [stats, setStats] = useState({
    total: 0,
    rps: 0,
    isConnected: false
  });

  useEffect(() => {
    const eventSource = new EventSource('/api/stats-stream');

    eventSource.onopen = () => {
      setStats(prev => ({ ...prev, isConnected: true }));
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStats({
          total: data.total,
          rps: data.rps,
          isConnected: true
        });
      } catch (e) {
        console.error('Parse error:', e);
      }
    };

    eventSource.onerror = () => {
      setStats(prev => ({ ...prev, isConnected: false }));
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const makeRequest = async () => {
    await fetch('/api/request-logger');
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '2rem'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Live Request Monitor
      </h1>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem', 
        marginBottom: '2rem'
      }}>
        <div style={statsCardStyle}>
          <div style={statLabelStyle}>Total Requests</div>
          <div style={statValueStyle}>{stats.total}</div>
        </div>
        
        <div style={statsCardStyle}>
          <div style={statLabelStyle}>Requests/sec</div>
          <div style={{ 
            ...statValueStyle, 
            color: stats.rps > 5 ? '#d32f2f' : stats.rps > 2 ? '#ed6c02' : '#2e7d32'
          }}>
            {stats.rps}
          </div>
        </div>
      </div>

      <div style={{ 
        textAlign: 'center', 
        padding: '1rem', 
        backgroundColor: stats.isConnected ? '#e8f5e9' : '#ffebee',
        borderRadius: '8px',
        marginBottom: '1.5rem'
      }}>
        Connection: {stats.isConnected ? '✅ Live' : '⚠️ Disconnected'}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button 
          onClick={makeRequest}
          style={buttonStyle}
        >
          Simulate 1 Request
        </button>
        
        <button 
          onClick={() => {
            for (let i = 0; i < 10; i++) {
              setTimeout(makeRequest, i * 100);
            }
          }}
          style={{ ...buttonStyle, backgroundColor: '#d32f2f' }}
        >
          Simulate 10 Requests
        </button>
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem' }}>Как это работает:</h3>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li>Каждый запрос к <code>/api/request-logger</code> фиксируется</li>
          <li>Система считает запросы за последнюю секунду (RPS)</li>
          <li>Данные обновляются каждые 500мс через Server-Sent Events</li>
        </ul>
        
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.5rem', 
          backgroundColor: '#fff8e1',
          borderRadius: '4px'
        }}>
          ⚠️ <strong>Важно:</strong> На Vercel данные будут сбрасываться при простоях.<br />
          Для production используйте Redis (покажу как ниже)
        </div>
      </div>
    </div>
  );
}

// Стили для компонентов
const statsCardStyle = {
  padding: '1.5rem',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  textAlign: 'center' as const
};

const statLabelStyle = {
  fontSize: '0.9rem',
  color: '#6c757d',
  marginBottom: '0.5rem'
};

const statValueStyle = {
  fontSize: '2.5rem',
  fontWeight: 'bold' as const,
  color: '#1976d2'
};

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  backgroundColor: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.2s'
};