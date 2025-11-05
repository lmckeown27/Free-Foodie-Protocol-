import React, { useState } from 'react';
import StudentSidebar from './StudentSidebar';
import PantrySidebar from './PantrySidebar';
import SupplierSidebar from './SupplierSidebar';

const RoleSidebar = ({ showAddForm, setShowAddForm }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  switch (user.role) {
    case 'student':
      return <StudentSidebar user={user} />;
    case 'pantry':
      return <PantrySidebar user={user} />;
    case 'supplier':
      return (
        <SupplierSidebar 
          user={user} 
          showAddForm={showAddForm}
          setShowAddForm={setShowAddForm}
        />
      );
    default:
      return null;
  }
};

export default RoleSidebar;

