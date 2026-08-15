import React from 'react';
import { 
  HomeIcon, 
  ChartPieIcon, 
  WalletIcon, 
  UserIcon, 
  PlusIcon 
} from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid } from '@heroicons/react/24/solid';

const BottomNav = ({ onOpenModal }) => {
  return (
    <div className="bottom-nav">
      <div className="nav-item active">
        <HomeSolid className="w-6 h-6" style={{ width: 28, height: 28 }} />
      </div>
      <div className="nav-item">
        <ChartPieIcon style={{ width: 28, height: 28 }} />
      </div>
      
      {/* Spacer for FAB */}
      <div style={{ width: '60px' }}></div>
      
      <div className="fab-container">
        <div className="fab-button" onClick={onOpenModal}>
          <PlusIcon style={{ width: 32, height: 32, strokeWidth: 2.5 }} />
        </div>
      </div>

      <div className="nav-item">
        <WalletIcon style={{ width: 28, height: 28 }} />
      </div>
      <div className="nav-item">
        <UserIcon style={{ width: 28, height: 28 }} />
      </div>
    </div>
  );
};

export default BottomNav;
