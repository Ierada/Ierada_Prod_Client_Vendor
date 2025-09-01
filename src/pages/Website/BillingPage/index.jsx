import React from 'react';

const Billing = () => {
  const tableData = [
    {
      product: 'Rich Maroon Suit',
      description: 'Blue cotton, 42 Size',
      quantity: 1,
      price: 3034.0,
      amount: 2500.0,
    },
    {
      product: 'Banarasi Saari',
      description: 'Polo Cotton, peach color',
      quantity: 1,
      price: 2500.0,
      amount: 2500.0,
    },
    {
      product: 'Sherwani Suit',
      description: 'Cotton Sherwani XL size',
      quantity: 1,
      price: 6000.0,
      amount: 6000.0,
    },
  ];

  const totals = {
    subtotal: 9000.0,
    discount: 180.0, // 2% of 9000
    total: 8820.0,
    amountPaid: 8820.0,
  };

  return (
    <div className="bg-gray-100 p-6 sm:p-10 lg:p-16">
      <div className="bg-white shadow-md rounded-md p-6 sm:p-10">
        <div className="text-center sm:text-left text-[#4C4C1F]">
          <h1 className="text-4xl font-bold ">Invoice</h1>
          <p className="mt-2 text-base font-medium">Order #302011</p>
          <p className="mt-1 text-base">
            Invoice Date: <span className="font-bold">12 November, 2024</span>
          </p>
        </div>

        {/* Address Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 text-[#4C4C1F]">
          <div>
            <h2 className="font-bold text-xl">Billed To</h2>
            <p className="text-sm font-bold">Seema Goyal</p>
            <p className="text-sm font-medium">Seema@gmail.com</p>
            <p className="text-sm font-medium">1222, Sastri Nagar, Delhi, IN</p>
            <p className="text-sm font-medium">+91 99999 99999</p>
          </div>
          <div>
            <h2 className="font-bold text-xl">From</h2>
            <p className="font-bold text-sm">SuiDhaga PVT. LTD</p>
            <p className="text-sm font-medium">suidhaga.com</p>
            <p className="text-sm font-medium">1222, Bangalore, Karnataka</p>
            <p className="text-sm font-medium">+91 90089 89898</p>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-8">
          <table className="min-w-full border-collapse border-b-2 border-[#4C4C1F]">
            <thead>
              <tr>
                <th className="border-b-2 border-[#4C4C1F] px-4 py-2 text-left text-[#4C4C1F] text-xl font-bold">
                  Product
                </th>
                <th className="border-b-2 border-[#4C4C1F] px-4 py-2 text-left text-[#4C4C1F] text-xl font-bold">
                  Quantity
                </th>
                <th className="border-b-2 border-[#4C4C1F] px-4 py-2 text-left text-[#4C4C1F] text-xl font-bold">
                  Price
                </th>
                <th className="border-b-2 border-[#4C4C1F] px-4 py-2 text-left text-[#4C4C1F] text-xl font-bold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((item, index) => (
                <tr key={index} className="border-b-2 border-[#4C4C1F]">
                  <td className="text-base font-bold px-4 py-2 text-[#4C4C1F]">
                    {item.product}
                    <br />
                    <span className="text-sm text-[#4C4C1F]">
                      {item.description}
                    </span>
                  </td>
                  <td className="text-base font-bold px-4 py-2 text-[#4C4C1F]">
                    {item.quantity}
                  </td>
                  <td className="text-base font-bold px-4 py-2 text-[#4C4C1F]">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="text-base font-bold px-4 py-2 text-[#4C4C1F]">
                    ₹{item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="mt-8 flex justify-end ">
          <div className="w-1/3">
            <div className="flex justify-between  pt-2 text-[#4C4C1F] font-normal">
              <p>Subtotal</p>
              <p>₹{totals.subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between border-t border-[#4C4C1F] pt-2 text-[#4C4C1F] font-normal">
              <p>Discount (2%)</p>
              <p>-₹{totals.discount.toFixed(2)}</p>
            </div>
            <div className="flex justify-between border-t border-[#4C4C1F] pt-2 text-[#4C4C1F] font-normal">
              <p>Total</p>
              <p>₹{totals.total.toFixed(2)}</p>
            </div>
            <div className="flex justify-between border-t border-[#4C4C1F] pt-2 text-[#4C4C1F] font-normal">
              <p>Amount Paid</p>
              <p>₹{totals.amountPaid.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
