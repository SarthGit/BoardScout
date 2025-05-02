import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  FaMapMarkerAlt, 
  FaDollarSign, 
  FaRuler, 
  FaEye, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle,
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaPhone,
  FaEnvelope,
  FaLocationArrow,
  FaSun,
  FaMoon,
  FaCloud
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { UserContext } from "../context/userContext";
import LoginRequiredModal from "../components/LoginRequiredModal";

const BillboardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [billboard, setBillboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Fetch billboard data from API
  useEffect(() => {
    const fetchBillboardDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try multiple potential API endpoints to find the billboard
        const endpoints = [
          `http://localhost:5000/api/billboards/${id}`,
          `http://localhost:5000/api/billboards/billboard/${id}`,
          `http://localhost:5000/api/billboard/${id}`
        ];
        
        let responseData = null;
        let succeeded = false;
        
        // Try each endpoint until we get a successful response
        for (const endpoint of endpoints) {
          try {
            console.log(`Trying to fetch billboard from: ${endpoint}`);
            const response = await axios.get(endpoint, {
              withCredentials: true
            });
            
            if (response.data && (response.data.success || response.data.billboard)) {
              console.log("Billboard data found at endpoint:", endpoint, response.data);
              // Some endpoints return data.billboard, others might return data directly
              responseData = response.data.billboard || response.data;
              succeeded = true;
              break;
            }
          } catch (endpointError) {
            console.log(`Error with endpoint ${endpoint}:`, endpointError.message);
            // Continue to next endpoint
          }
        }
        
        if (succeeded && responseData) {
          console.log("Processing billboard data:", responseData);
          setBillboard(formatBillboardData(responseData));
        } else {
          // If all API endpoints fail, try one last endpoint that might return any billboard
          try {
            console.log("Trying to fetch any billboard");
            const fallbackResponse = await axios.get('http://localhost:5000/api/billboards', {
              withCredentials: true
            });
            
            if (fallbackResponse.data && Array.isArray(fallbackResponse.data) && fallbackResponse.data.length > 0) {
              // Find a billboard that might match our ID or use the first one
              const matchingBillboard = fallbackResponse.data.find(b => 
                b._id === id || 
                b.id === id || 
                (b.location && b.location.toLowerCase().includes(id.toLowerCase()))
              ) || fallbackResponse.data[0];
              
              console.log("Using fallback billboard:", matchingBillboard);
              setBillboard(formatBillboardData(matchingBillboard));
            } else {
              // If still no data, use mock data as last resort
              console.log("Using mock billboard data");
              const mockBillboards = getMockBillboards();
              const foundBillboard = mockBillboards.find(b => 
                b.id === id || 
                b.id === parseInt(id) || 
                (b.location && b.location.toLowerCase().includes(id.toLowerCase()))
              ) || mockBillboards[0];
              
              setBillboard(foundBillboard);
            }
          } catch (fallbackError) {
            console.error("All endpoints failed:", fallbackError);
            throw new Error("Failed to fetch billboard details from any endpoint");
          }
        }
      } catch (err) {
        console.error("Error fetching billboard details:", err);
        setError("Failed to load billboard details. Please try again later.");
        
        // Fallback to mock data if API call fails
        const mockBillboards = getMockBillboards();
        const foundBillboard = mockBillboards.find(b => b.id === id || b.id === parseInt(id)) || mockBillboards[0];
        setBillboard(foundBillboard);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBillboardDetails();
    
    // Check if billboard is in favorites
    const checkFavoriteStatus = () => {
      if (user) {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(id));
      }
    };
    
    checkFavoriteStatus();
  }, [id, user]);
  
  // Format billboard data from API
  const formatBillboardData = (apiData) => {
    if (!apiData) return null;
    
    // Default values for missing data
    const defaultImages = [
      "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?q=80&w=2664&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=2670&auto=format&fit=crop",
    ];
    
    // Handle different size formats
    let sizeString = "12 × 36 ft";
    if (apiData.size) {
      if (typeof apiData.size === 'string') {
        sizeString = apiData.size;
      } else if (typeof apiData.size === 'object') {
        const height = apiData.size.height || 12;
        const width = apiData.size.width || 36;
        const unit = apiData.size.unit || 'feet';
        sizeString = `${height} × ${width} ${unit.includes('ft') ? unit : unit === 'feet' ? 'ft' : unit}`;
      }
    }
    
    // Handle different image formats
    let images = defaultImages;
    if (apiData.images && Array.isArray(apiData.images) && apiData.images.length > 0) {
      images = apiData.images;
    } else if (apiData.imageUrl) {
      images = [apiData.imageUrl, ...defaultImages];
    }
    
    // Handle owner information
    let owner = {
      name: "Billboard Media Ltd",
      phone: "(022) 1234-5678",
      email: "contact@billboardmedia.com",
      response: "Usually responds within 24 hours"
    };
    
    if (apiData.owner) {
      if (typeof apiData.owner === 'object') {
        owner = {
          ...owner,
          ...apiData.owner
        };
      }
    } else if (apiData.ownerName || apiData.ownerPhone || apiData.ownerEmail) {
      owner = {
        name: apiData.ownerName || owner.name,
        phone: apiData.ownerPhone || owner.phone,
        email: apiData.ownerEmail || owner.email,
        response: apiData.ownerResponse || owner.response
      };
    }
    
    return {
      id: apiData._id || apiData.id || "unknown",
      location: apiData.location || "Unknown Location",
      address: apiData.address || `${apiData.location || "Unknown Location"}`,
      latitude: apiData.latitude || 0,
      longitude: apiData.longitude || 0,
      price: apiData.price || 100000,
      priceUnit: apiData.priceUnit || "week",
      size: sizeString,
      dimensions: apiData.dimensions || { width: 12, height: 36, unit: "feet" },
      views: apiData.views || `${Math.floor(Math.random() * 900) + 100}K daily`,
      dailyImpressions: apiData.dailyImpressions || Math.floor(Math.random() * 900000) + 100000,
      images: images,
      available: apiData.available !== undefined ? apiData.available : true,
      type: apiData.type || "Static",
      facingDirection: apiData.facingDirection || "South",
      minBookingDays: apiData.minBookingDays || 7,
      description: apiData.description || "Premium billboard in a high-visibility location.",
      features: Array.isArray(apiData.features) && apiData.features.length > 0 
        ? apiData.features 
        : [
            "Illuminated 24/7",
            "Premium vinyl printing",
            "High visibility from multiple angles",
            "Weather resistant",
            "Long-term discounts available"
          ],
      nearbyAttractions: Array.isArray(apiData.nearbyAttractions) && apiData.nearbyAttractions.length > 0 
        ? apiData.nearbyAttractions 
        : [
            "Shopping District",
            "Business Center",
            "Railway Station",
            "Major Highway"
          ],
      owner: owner
    };
  };
  
  // Mock billboards data for fallback
  const getMockBillboards = () => {
    return [
      {
        id: 1,
        location: "Marine Drive, Mumbai",
        address: "Near NCPA, Marine Drive, Mumbai 400021",
        latitude: 18.9438,
        longitude: 72.8230,
        price: 125000,
        priceUnit: "week",
        size: "12 × 40 ft",
        dimensions: {
          width: 12,
          height: 40,
          unit: "feet"
        },
        views: "800K daily",
        dailyImpressions: 800000,
        images: [
          "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?q=80&w=2664&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1566552881560-0be862a7c445?q=80&w=2670&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=2665&auto=format&fit=crop"
        ],
        available: true,
        type: "Digital",
        facingDirection: "West",
        minBookingDays: 7,
        description: "Premium digital billboard on the iconic Marine Drive. Exceptional visibility with high exposure to affluent residents and tourists along the Queen's Necklace. Perfect for luxury brands and high-end products seeking to make an impact in Mumbai's most prestigious location.",
        features: [
          "High resolution LED display",
          "24/7 operation with peak brightness control",
          "Premium location with high traffic",
          "Tourist hotspot",
          "Multiple ad slots available",
          "Weather resistant technology",
          "Real-time content updates possible"
        ],
        nearbyAttractions: [
          "Nariman Point",
          "Wankhede Stadium",
          "NCPA",
          "Gateway of India",
          "Taj Mahal Palace Hotel"
        ],
        owner: {
          name: "Mumbai Outdoor Media Ltd.",
          phone: "(022) 2285-4321",
          email: "bookings@mumbaioutdoormedia.com",
          response: "Usually responds within 24 hours"
        }
      },
      {
        id: 2,
        location: "Linking Road, Bandra",
        address: "Near Linking Road Junction, Bandra West, Mumbai 400050",
        latitude: 19.0633,
        longitude: 72.8324,
        price: 150000,
        priceUnit: "week",
        size: "15 × 45 ft",
        dimensions: {
          width: 15,
          height: 45,
          unit: "feet"
        },
        views: "650K daily",
        dailyImpressions: 650000,
        images: [
          "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=2664&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1617470282896-8dc2cc9f9975?q=80&w=2670&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1616196334218-293bd5163dfc?q=80&w=2573&auto=format&fit=crop"
        ],
        available: true,
        type: "Static",
        facingDirection: "South",
        minBookingDays: 14,
        description: "Large format billboard in Mumbai's premier shopping district. High visibility to upscale shoppers and young professionals in one of the city's trendiest areas. This location offers exceptional exposure to fashion-forward consumers with high spending power.",
        features: [
          "Illuminated 24/7",
          "Premium vinyl printing",
          "High visibility from multiple angles",
          "Fashion district location",
          "Celebrity hotspot",
          "Long-term discounts available"
        ],
        nearbyAttractions: [
          "Bandra Bandstand",
          "Hill Road Shopping",
          "Carter Road Promenade",
          "Mehboob Studio",
          "Premium Brand Outlets"
        ],
        owner: {
          name: "Bandra Media Solutions",
          phone: "(022) 2647-8900",
          email: "contact@bandramedia.in",
          response: "Usually responds within 2 days"
        }
      }
    ];
  };

  const handleFavoriteToggle = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    setIsFavorite(!isFavorite);
    
    // Save to localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter(favId => favId !== id);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } else {
      // Add to favorites
      favorites.push(id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  };

  const handleContactOwner = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    // Navigate to quotation page with billboard details
    navigate(`/billboards/${id}/quotation`, {
      state: {
        billboard: {
          id: billboard.id,
          location: billboard.location,
          address: billboard.address,
          price: billboard.price,
          priceUnit: billboard.priceUnit,
          size: billboard.size,
          type: billboard.type,
          images: billboard.images,
          owner: billboard.owner
        },
        user: {
          name: user.name,
          email: user.email,
          company: user.company || ''
        }
      }
    });
  };
  
  const handleViewOnMap = () => {
    if (billboard.latitude && billboard.longitude) {
      window.open(`https://maps.google.com/?q=${billboard.latitude},${billboard.longitude}`, '_blank');
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(billboard.address || billboard.location)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !billboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Billboard Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || "The billboard you're looking for doesn't exist or has been removed."}
            </p>
            <Link
              to="/find-billboards"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaArrowLeft className="mr-2" />
              Back to Billboard Listings
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            </li>
            <li className="flex items-center">
              <span className="text-gray-400 mx-1">/</span>
              <Link to="/find-billboards" className="text-gray-500 hover:text-gray-700">Billboards</Link>
            </li>
            <li className="flex items-center">
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-gray-900 font-medium" aria-current="page">{billboard.location}</span>
            </li>
          </ol>
        </nav>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-6">
            <div className="lg:col-span-3">
              <div className="relative h-80 md:h-96 lg:h-[30rem] rounded-lg overflow-hidden">
                <img
                  src={billboard.images[selectedImage]}
                  alt={`${billboard.location} - View ${selectedImage + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                {billboard.images.map((image, idx) => (
                  <div
                    key={idx}
                    className={`h-20 w-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 ${
                      selectedImage === idx ? "border-blue-600" : "border-transparent"
                    }`}
                    onClick={() => setSelectedImage(idx)}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-2 mt-6 lg:mt-0">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{billboard.location}</h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <FaMapMarkerAlt className="text-gray-400 mr-1" />
                    {billboard.address}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleFavoriteToggle}
                    className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                      isFavorite ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {isFavorite ? <FaHeart className="h-6 w-6" /> : <FaRegHeart className="h-6 w-6" />}
                  </button>
                  <button 
                    onClick={handleViewOnMap}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <FaLocationArrow className="h-6 w-6" />
                  </button>
                  <button className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                    <FaShare className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-500 mb-1">
                    <FaDollarSign className="mr-1 text-green-600" />
                    <span>Price</span>
                  </div>
                  <div className="text-xl font-semibold">₹{billboard.price.toLocaleString()}/{billboard.priceUnit}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-500 mb-1">
                    <FaRuler className="mr-1 text-blue-600" />
                    <span>Size</span>
                  </div>
                  <div className="text-xl font-semibold">{billboard.size}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-500 mb-1">
                    <FaEye className="mr-1 text-purple-600" />
                    <span>Daily Views</span>
                  </div>
                  <div className="text-xl font-semibold">{billboard.views}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-500 mb-1">
                    <FaCalendarAlt className="mr-1 text-orange-600" />
                    <span>Min Booking</span>
                  </div>
                  <div className="text-xl font-semibold">{billboard.minBookingDays} days</div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center mb-2">
                  <span className="flex items-center mr-3">
                    <span className={`mr-1 ${billboard.available ? "text-green-600" : "text-red-600"}`}>
                      {billboard.available ? <FaCheckCircle /> : <FaTimesCircle />}
                    </span>
                    <span className="font-medium">{billboard.available ? "Available Now" : "Currently Booked"}</span>
                  </span>
                  <span className="text-gray-500 text-sm">|</span>
                  <span className="ml-3 text-gray-600">{billboard.type}</span>
                  <span className="text-gray-500 text-sm mx-3">|</span>
                  <span className="text-gray-600">Facing {billboard.facingDirection}</span>
                </div>
                
                <button
                  onClick={handleContactOwner}
                  className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                >
                  Connect with Owner
                </button>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-2">Owner Information</h3>
                  <p className="font-medium">{billboard.owner.name}</p>
                  <div className="mt-3 flex flex-col space-y-2">
                    <a href={`tel:${billboard.owner.phone}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                      <FaPhone className="mr-2" />
                      {billboard.owner.phone}
                    </a>
                    <a href={`mailto:${billboard.owner.email}`} className="text-blue-600 hover:text-blue-800 flex items-center">
                      <FaEnvelope className="mr-2" />
                      {billboard.owner.email}
                    </a>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{billboard.owner.response}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Description and Features */}
          <div className="border-t border-gray-200 mt-6">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 whitespace-pre-line">{billboard.description}</p>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Billboard Features</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {billboard.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <FaCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nearby Attractions</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {billboard.nearbyAttractions.map((attraction, idx) => (
                    <li key={idx} className="flex items-center">
                      <FaMapMarkerAlt className="text-red-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{attraction}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* New section: Visibility & Weather */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visibility & Environmental Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                    <FaSun className="text-yellow-500 text-2xl mb-2" />
                    <h4 className="font-medium text-gray-900">Daytime Visibility</h4>
                    <p className="text-gray-600 text-center mt-1">Excellent</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                    <FaMoon className="text-indigo-600 text-2xl mb-2" />
                    <h4 className="font-medium text-gray-900">Nighttime Visibility</h4>
                    <p className="text-gray-600 text-center mt-1">Good (Illuminated)</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                    <FaCloud className="text-blue-400 text-2xl mb-2" />
                    <h4 className="font-medium text-gray-900">Weather Resilience</h4>
                    <p className="text-gray-600 text-center mt-1">Weather-resistant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Login Required Modal */}
      {showLoginModal && (
        <LoginRequiredModal 
          onClose={() => setShowLoginModal(false)}
          onLogin={() => navigate("/login")}
          onSignup={() => navigate("/signup")}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default BillboardDetails;