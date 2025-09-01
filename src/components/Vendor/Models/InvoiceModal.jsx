import React from 'react';
import { X } from 'lucide-react';
import {
  formatDate,
  formatTime,
} from '../../../utils/date&Time/dateAndTimeFormatter';

const InvoiceModal = ({ isOpen, onClose, invoice }) => {
  if (!isOpen) return null;

  const setToUpperChars = str => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className='fixed inset-0 bg-[black] bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-2xl p-6 relative'>
        <button
          onClick={onClose}
          className='absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full'
        >
          <X className='w-5 h-5' />
        </button>

        <h2 className='text-2xl text-black font-semibold mb-6'>
          Invoice Details
        </h2>

        <div className='grid grid-cols-2 gap-4'>
          <DetailItem label='Invoice ID' value={invoice.invoice_number} />
          <DetailItem
            label='Invoice Date'
            value={
              formatDate(invoice.created_at) + ' ' + formatTime(invoice.created_at)
            }
          />
          {/* <DetailItem
            label='Customer Name'
            value={
              invoice.Address?.first_name || invoice.Address?.last_name
                ? invoice.Address.first_name + ' ' + invoice.Address.last_name
                : 'N/A'
            }
          /> */}
          {/* <DetailItem
            label='Phone'
            value={invoice.Address?.phone ? '+91 ' + invoice.Address.phone : 'N/A'}
          /> */}
          {/* <DetailItem label='Channel' value={invoice.channel} /> */}
          {/* <DetailItem label='Amount' value={invoice.price} /> */}
          <DetailItem
            label='Payment Status'
            // value={setToUpperChars(invoice.payment_type)}
          />
          <DetailItem
            label='Invoice Status'
            // value={setToUpperChars(invoice.invoice_status)}
          />
          <DetailItem
            label='Invoice Type'
            // value={setToUpperChars(invoice.invoice_type)}
          />
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <p className='text-sm text-gray-600'>{label}</p>
    <p className='font-medium'>{value}</p>
  </div>
);

export default InvoiceModal;
