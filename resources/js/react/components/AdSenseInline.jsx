import React from 'react';
import AdSenseVertical from './AdSenseVertical';
import { Card } from './ui';

/**
 * AdSense Inline Component
 * Komponen untuk menampilkan iklan inline di tengah konten
 * Digunakan untuk halaman yang kompleks atau tidak memiliki sidebar
 */
const AdSenseInline = ({ adSlot = "9427110099", className = "" }) => {
    return (
        <div className={`my-8 ${className}`}>
            <Card padding="none" className="bg-gray-50">
                <div className="text-xs text-center text-gray-400 py-2 border-b border-gray-100">
                    Iklan
                </div>
                <div className="flex justify-center items-center p-4">
                    <AdSenseVertical
                        adSlot={adSlot}
                        className="min-h-[250px] max-w-[300px]"
                    />
                </div>
            </Card>
        </div>
    );
};

export default AdSenseInline;
