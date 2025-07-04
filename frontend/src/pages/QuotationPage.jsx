import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaCalendarAlt, FaDollarSign, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaRuler } from "react-icons/fa";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const QuotationPage = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { billboard, user } = state || {};
  
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    budget: "",
    companyName: user?.company || "",
    contactEmail: user?.email || "",
    message: "",
    agreeToTerms: false
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect to /find-billboards after successful submission
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/find-billboards');
      }, 3000); // Redirect after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);
  
  if (!billboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Billboard Not Found</h2>
            <p className="text-gray-600 mb-6">
              The billboard details couldn't be loaded. Please go back and try again.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/quotations', {
        billboard: {
          id: billboard.id,
          location: billboard.location,
          address: billboard.address,
          price: billboard.price,
          priceUnit: billboard.priceUnit,
          size: billboard.size,
          type: billboard.type,
          owner: billboard.owner
        },
        user: {
          name: user.name,
          email: user.email,
          company: user.company || ''
        },
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget,
        companyName: formData.companyName,
        contactEmail: formData.contactEmail,
        message: formData.message
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error submitting quotation:", error);
      alert("Failed to submit quotation request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  const calculateEstimatedCost = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (billboard.priceUnit === "week") {
      const weeks = Math.ceil(diffDays / 7);
      return weeks * billboard.price;
    } else if (billboard.priceUnit === "month") {
      const months = Math.ceil(diffDays / 30);
      return months * billboard.price;
    }
    
    return diffDays * billboard.price;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Request a Quotation</h1>
            <p className="text-gray-600 mt-1">Fill out the form below to contact the billboard owner</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
            <div className="lg:col-span-2">
              {success ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <h2 className="text-xl font-bold text-green-800 mb-2">Request Sent Successfully!</h2>
                  <p className="text-green-700 mb-4">
                    Your quotation request has been sent to {billboard.owner.name}. 
                    They will contact you at {formData.contactEmail} shortly.
                  </p>
                  <p className="text-green-600 animate-pulse">
                    Redirecting to billboards listing...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* [Keep all the form fields exactly the same as before] */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          min={formData.startDate || new Date().toISOString().split('T')[0]}
                          className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <FaCalendarAlt className="absolute right-3 top-2.5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                      Budget (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="Enter your budget for this booking"
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <FaDollarSign className="absolute right-3 top-2.5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Your company name"
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <FaBuilding className="absolute right-3 top-2.5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        placeholder="Your contact email"
                        className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <FaEnvelope className="absolute right-3 top-2.5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Any additional details about your campaign or requirements"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreeToTerms"
                        name="agreeToTerms"
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                        I agree to the terms and conditions
                      </label>
                      <p className="text-gray-500">
                        By submitting this form, you agree to share your contact information with the billboard owner.
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Sending Request...' : 'Submit Quotation Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Billboard Details</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Location</h4>
                      <p className="text-gray-600">{billboard.location}</p>
                      <p className="text-gray-500 text-sm">{billboard.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaDollarSign className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Pricing</h4>
                      <p className="text-gray-600">₹{billboard.price.toLocaleString()}/{billboard.priceUnit}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaRuler className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Size</h4>
                      <p className="text-gray-600">{billboard.size}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Estimated Cost</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{calculateEstimatedCost().toLocaleString()}
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      Based on selected dates and current pricing
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Owner Contact</h4>
                    <div className="space-y-2">
                      <p className="text-gray-600">{billboard.owner.name}</p>
                      <a href={`mailto:${billboard.owner.email}`} className="block text-blue-600 hover:text-blue-800">
                        {billboard.owner.email}
                      </a>
                      <a href={`tel:${billboard.owner.phone}`} className="block text-blue-600 hover:text-blue-800">
                        {billboard.owner.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default QuotationPage;