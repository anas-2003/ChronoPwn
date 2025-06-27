import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Chart } from 'chart.js/auto';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function App() {
  const [targets, setTargets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState({
    labels: ['Windows', 'Linux', 'IoT', 'Other'],
    datasets: [{
      label: 'Target Systems',
      data: [65, 59, 80, 81],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
      ],
    }]
  });

  useEffect(() => {
    // Fetch initial data from backend
    axios.get('http://localhost:5000/api/targets')
      .then(response => setTargets(response.data))
      .catch(error => console.error('Error fetching targets:', error));
    
    // Simulate real-time logs
    const logInterval = setInterval(() => {
      setLogs(prev => [
        ...prev, 
        `Attack detected at ${new Date().toLocaleTimeString()}`
      ]);
    }, 5000);
    
    return () => clearInterval(logInterval);
  }, []);

  const handleAttack = (targetId) => {
    console.log(`Initiating attack on target ${targetId}`);
    // In real implementation, this would call backend API
  };

  return (
    <div className="dashboard">
      <h1>ChronoPwn Global Control Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="map-container">
          <MapContainer center={[31.7917, -7.0926]} zoom={3} style={{ height: '400px' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {targets.map(target => (
              <Marker 
                key={target.id} 
                position={[target.lat, target.lng]}
                eventHandlers={{ click: () => handleAttack(target.id) }}
              >
                <Popup>
                  {target.name} <br /> {target.ip}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        
        <div className="analytics-container">
          <h2>System Distribution</h2>
          <Bar data={analytics} />
        </div>
        
        <div className="logs-container">
          <h2>Attack Logs</h2>
          <div className="logs">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;