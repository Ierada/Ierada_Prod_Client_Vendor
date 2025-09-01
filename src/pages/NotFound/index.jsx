import React from 'react';
import BgImg from '/assets/bg/404img.png';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {

  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <img src={BgImg} alt="Error" className="h-96 mb-4" />
      <h1 className="text-4xl font-bold mb-2">404, Page not found</h1>
      <p className="text-gray-600 mb-6">
        Something went wrong. It's look that your requested could not be found.
        <br />
        It's look like the link is broken or the page is removed.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
        >
          Go Back
        </button>
        <a
          href="/"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;