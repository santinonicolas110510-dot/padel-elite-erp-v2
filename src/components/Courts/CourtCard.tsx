"use client";

import React from 'react';
import * as Lucide from 'lucide-react';
import { motion } from 'framer-motion';

export const CourtCard = ({ court, bookings, onBookingClick, onNewBooking, isMobile, theme }: any) => {
    return (
        <div style={{
            background: theme.card,
            borderRadius: '24px',
            border: `1px solid ${theme.border}`,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '18px', fontWeight: '900' }}>Cancha {court.id}</h4>
                <div style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: `${theme.accent}15`,
                    color: theme.accent,
                    fontSize: '10px',
                    fontWeight: '900'
                }}>
                    ESTÁNDAR
                </div>
            </div>
            {/* Component implementation continues in page.tsx for now to maintain consistency with existing state management */}
        </div>
    );
};
