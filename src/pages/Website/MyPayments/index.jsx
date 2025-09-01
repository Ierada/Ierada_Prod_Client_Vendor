import React, { useState } from 'react';
import { AccountInfo } from '../../../components/Website/AccountInfo';
import { Trash2 } from 'lucide-react';

const paymentOptions = [
  { id: 'cod', name: 'Cash on Delivery', icon: '₹' },
  { id: 'upi', name: 'UPI Payment', icon: 'UPI' },
  { id: 'paypal', name: 'Paypal', icon: 'PP' },
  { id: 'amazon', name: 'Amazon Pay', icon: 'AP' },
  { id: 'card', name: 'Debit/Credit Card', icon: '💳' }
];

const savedPayments = [
  {
    id: 1,
    type: 'Google Pay',
    details: 'abcdlavanya@oksbi'
  },
  {
    id: 2,
    type: 'Google Pay',
    details: 'abcdlavanya@oksbi'
  }
];

const PaymentsPage = () => {
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [savedMethods, setSavedMethods] = useState(savedPayments);
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvc: ''
  });

  // Dummy API functions
  const addPaymentMethod = async () => {
    console.log('Adding payment method:', cardDetails);
    // API call would go here
  };

  const removePaymentMethod = async (id) => {
    setSavedMethods(methods => methods.filter(method => method.id !== id));
  };

  return (
    <main className="min-h-screen bg-white px-4 md:px-20 py-8 flex flex-col md:flex-row gap-10">
      
      <section className='w-full md:w-1/3 lg:w-1/4'>
        <AccountInfo activeSection="payments" />
      </section>

      <section className="w-full md:w-4/5">
        <h2 className="text-xl font-semibold mb-6">Your Saved Payments</h2>
        
        <div className="space-y-4 mb-8">
          {savedMethods?.map(method => (
            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  GP
                </div>
                <div>
                  <h3 className="font-medium">{method.type}</h3>
                  <p className="text-sm text-gray-600">{method.details}</p>
                </div>
              </div>
              <button
                onClick={() => removePaymentMethod(method.id)}
                className="text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-6">Add Payment Option</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {paymentOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setSelectedPayment(option.id)}
              className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${
                selectedPayment === option.id ? 'border-purple-500 bg-purple-50' : ''
              }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <span className="text-sm text-center">{option.name}</span>
            </button>
          ))}
        </div>

        {selectedPayment === 'card' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name on Card</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Card Number</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Expire Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="w-full p-2 border rounded"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CVC</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={cardDetails.cvc}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                />
              </div>
            </div>
            <button
              onClick={addPaymentMethod}
              className="w-full bg-black text-white py-3 rounded-lg mt-4"
            >
              Add Payment Method
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default PaymentsPage;