"use client";

import React from 'react';
import * as Lucide from 'lucide-react';

export const SidebarItem = ({ id, label, icon: Icon, activeTab, setActiveTab, accentColor }: any) => (
    <button
        onClick={() => setActiveTab(id)}
        style={{
            width: '100%',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderRadius: '15px',
            background: activeTab === id ? `${accentColor}15` : 'transparent',
            color: activeTab === id ? accentColor : '#555',
            border: 'none',
            borderLeft: activeTab === id ? `4px solid ${accentColor}` : '4px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '13px',
            fontWeight: 800,
            marginBottom: '5px'
        }}
    >
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px'
        }}>
            {Icon && <Icon size={18} />}
        </div>
        <span>{label}</span>
    </button>
);
