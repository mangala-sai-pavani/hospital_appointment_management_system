import React from 'react';
import Navbar from '../components/Navbar';
import AmbulanceManagement from '../components/AmbulanceManagement';

export default function AmbulanceService() {
  return (
    <div>
      <Navbar
        title="Ambulance & Patient Transport"
        subtitle="Hospital transport dispatch, vehicle fleet & pricing configuration"
      />
      <AmbulanceManagement />
    </div>
  );
}
