/**
 * Submit a new support ticket
 * @param {FormData} formData - Form data containing issue details and optional file
 * @returns {Promise} Promise that resolves with the created ticket
 */
export const submitSupportTicket = async (formData) => {
    try {
      const response = await fetch(`/api/createTicket/`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit ticket');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      throw error;
    }
  };
  
  /**
   * Get complaint history for the current user
   * @returns {Promise} Promise that resolves with array of complaints
   */
  export const getComplaintHistory = async () => {
    try {
      const response = await fetch('/api/support/complaints');
      
      if (!response.ok) {
        throw new Error('Failed to fetch complaint history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching complaint history:', error);
      throw error;
    }
  };
  
  /**
   * Upload support ticket attachment
   * @param {File} file - File to upload
   * @returns {Promise} Promise that resolves with uploaded file details
   */
  export const uploadSupportFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/support/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading support file:', error);
      throw error;
    }
  };