import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const PickupQRCode = ({ allocation, student }) => {
  const [showQR, setShowQR] = useState(false);
  
  // Generate QR code data with allocation and student info
  const qrData = JSON.stringify({
    allocation_id: allocation.id,
    student_id: student.id,
    item_name: allocation.item_name,
    quantity: allocation.quantity,
    unit: allocation.unit,
    poas_score: allocation.poas_score,
    timestamp: new Date().toISOString(),
    verification_code: `FFQ-${allocation.id.substring(0, 8)}-${Date.now().toString(36)}`
  });
  
  return (
    <div>
      {!showQR ? (
        <button
          onClick={() => setShowQR(true)}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
        >
          Show QR for Pickup
        </button>
      ) : (
        <div className="bg-white rounded-lg p-4 border-2 border-primary-300 shadow-lg">
          <div className="text-center mb-3">
            <h3 className="font-bold text-gray-900 text-lg">Pickup QR Code</h3>
            <p className="text-sm text-gray-600">Show this to pantry staff</p>
          </div>
          
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg border border-gray-200">
            <QRCodeSVG 
              value={qrData} 
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          
          {/* Verification Code */}
          <div className="mt-4 p-3 bg-primary-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium text-center mb-1">Verification Code</p>
            <p className="text-sm font-mono text-center text-primary-700 font-bold">
              {qrData.split('"verification_code":"')[1]?.split('"')[0] || 'N/A'}
            </p>
          </div>
          
          {/* Allocation Details */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Item:</span>
              <span className="font-semibold text-gray-900">{allocation.item_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-semibold text-gray-900">{allocation.quantity} {allocation.unit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">POAS Score:</span>
              <span className="font-semibold text-primary-700">
                {allocation.poas_score ? allocation.poas_score.toFixed(2) : 'N/A'}
              </span>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Instructions:</strong> Show this QR code to pantry staff when you arrive. 
              They will scan it to confirm your pickup and complete the transaction on-chain.
            </p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={() => setShowQR(false)}
            className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Close QR Code
          </button>
        </div>
      )}
    </div>
  );
};

export default PickupQRCode;

