import React from 'react';
import AdSenseHorizontal from './AdSenseHorizontal';
import { Card } from './ui';

/**
 * AdSense Inline Component
 * Komponen untuk menampilkan iklan inline di tengah konten
 */
const AdSenseInline = ({ adSlot = "1519827772", className = "" }) => {
    return (
        <div className={`my-6 ${className}`}>
            <Card padding="none" className="bg-gray-50 border border-gray-100 overflow-hidden">
                <div className="text-[11px] text-center text-gray-400 py-1.5 border-b border-gray-100 bg-gray-50/50">
                    Iklan
                </div>
                <div className="flex justify-center items-center p-2 sm:p-4">
                    <AdSenseHorizontal
                        adSlot={adSlot}
                        className="w-full"
                    />
                </div>
            </Card>
        </div>
    );
};

export default AdSenseInline;
