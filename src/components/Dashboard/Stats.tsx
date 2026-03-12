"use client";

import React from 'react';
import * as Lucide from 'lucide-react';
import CountUp from 'react-countup';

export const StatCard = ({ label, value, color, icon: Icon, isMobile }: any) => (
    <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '20px',
        padding: isMobile ? '15px' : '25px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flex: 1
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: '#666', fontSize: '10px', fontWeight: '900', letterSpacing: '1px' }}>{label.toUpperCase()}</span>
            <div style={{
                width: isMobile ? '30px' : '40px',
                height: isMobile ? '30px' : '40px',
                borderRadius: '12px',
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color
            }}>
                {Icon && <Icon size={isMobile ? 14 : 18} />}
            </div>
        </div>
        <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '900', color: color, letterSpacing: '-0.5px' }}>
            $<CountUp end={value} duration={1.5} separator="." />
        </div>
    </div>
);

export const StatItem = ({ label, val, color, icon: Icon, isRaw }: any) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '15px',
        border: '1px solid rgba(255,255,255,0.04)'
    }}>
        <div style={{ flex: 1 }}>
            <div style={{ color: '#555', fontSize: '9px', fontWeight: '900', letterSpacing: '1px', marginBottom: '5px' }}>{label}</div>
            <div style={{ color: '#fff', fontWeight: '900', fontSize: '18px' }}>
                {isRaw ? val : `$${Math.round(val).toLocaleString()}`}
            </div>
        </div>
        <div style={{
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            background: `${color}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
        }}>
            {Icon && <Icon size={18} />}
        </div>
    </div>
);
