const Billboard = require("../models/Billboard");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Optional mock data if needed
const mockBillboards = [
  {
    id: "pune-01",
    location: "Pune",
    address: "MG Road",
    price: 5000,
    priceUnit: "week",
    size: { height: 20, width: 40, unit: "feet" },
    views: "120K daily",
    dailyImpressions: 150000,
    available: true,
    type: "Static",
    facingDirection: "South",
    minBookingDays: 7,
    description: "Prime location billboard in Pune",
    images: [],
    features: [
      "Illuminated 24/7",
      "Premium vinyl printing",
      "High visibility from multiple angles"
    ],
    nearbyAttractions: ["Shopping District", "Railway Station"],
    owner: {
      name: "Billboard Media Ltd",
      phone: "(022) 1234-5678",
      email: "contact@billboardmedia.com",
      response: "Usually responds within 24 hours"
    }
  },
  // Add more mock billboards as needed
];

// =================== Add Billboard ===================
const addBillboard = async (req, res) => {
  try {
    const {
      location,
      address,
      latitude,
      longitude,
      price,
      priceUnit,
      height,
      width,
      unit,
      views,
      dailyImpressions,
      available,
      type,
      facingDirection,
      minBookingDays,
      description,
      features,
      nearbyAttractions,
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerResponse
    } = req.body;

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "billboards",
          resource_type: "auto",
        });

        imageUrls.push(result.secure_url);

        fs.unlink(file.path, (err) => {
          if (err) console.error("Error removing temporary file:", err);
        });
      }
    }

    const parsedFeatures = features ? (typeof features === 'string' ? JSON.parse(features) : features) : [];
    const parsedNearbyAttractions = nearbyAttractions ? (typeof nearbyAttractions === 'string' ? JSON.parse(nearbyAttractions) : nearbyAttractions) : [];

    const newBillboard = new Billboard({
      location,
      address,
      latitude,
      longitude,
      price,
      priceUnit: priceUnit || "week",
      size: {
        height: Number(height),
        width: Number(width),
        unit: unit || "feet"
      },
      views: views || `${Math.floor(Math.random() * 900) + 100}K daily`,
      dailyImpressions: dailyImpressions || Math.floor(Math.random() * 900000) + 100000,
      available: available !== undefined ? available : true,
      type: type || "Static",
      facingDirection: facingDirection || "South",
      minBookingDays: minBookingDays || 7,
      description,
      images: imageUrls,
      features: parsedFeatures,
      nearbyAttractions: parsedNearbyAttractions,
      owner: {
        name: ownerName || "Billboard Media Ltd",
        phone: ownerPhone || "(022) 1234-5678",
        email: ownerEmail || "contact@billboardmedia.com",
        response: ownerResponse || "Usually responds within 24 hours"
      }
    });

    await newBillboard.save();

    return res.status(201).json({
      success: true,
      message: "Billboard added successfully",
      billboard: newBillboard,
    });
  } catch (error) {
    console.error("Error adding billboard:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add billboard",
      error: error.message,
    });
  }
};

// =================== Get All Billboards ===================
const getBillboards = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { location: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const billboards = await Billboard.find(query);

    if (billboards.length === 0) {
      return res.status(200).json({ message: "No billboards found" });
    }

    res.status(200).json(billboards);
  } catch (error) {
    console.error("Error fetching billboards:", error);
    res.status(500).json({ error: "An error occurred while fetching billboards" });
  }
};

// =================== Get Billboard Detail ===================
const getBillboardDetail = async (req, res) => {
  try {
    const billboardId = req.params.id;
    let billboard = null;

    if (billboardId.match(/^[0-9a-fA-F]{24}$/)) {
      billboard = await Billboard.findById(billboardId);
    }

    if (!billboard) {
      billboard = await Billboard.findOne({
        $or: [
          { location: { $regex: new RegExp(billboardId, "i") } },
          { address: { $regex: new RegExp(billboardId, "i") } },
          { "owner.name": { $regex: new RegExp(billboardId, "i") } },
        ],
      });
    }

    if (!billboard) {
      const mockBillboard = mockBillboards.find(b =>
        b.id === billboardId ||
        billboardId.toLowerCase().includes(b.location.toLowerCase())
      );

      if (mockBillboard) {
        return res.status(200).json({ success: true, billboard: mockBillboard });
      }

      const fallback = await Billboard.findOne({});
      if (fallback) {
        return res.status(200).json({
          success: true,
          billboard: fallback,
        });
      }

      return res.status(404).json({ success: false, message: "Billboard not found" });
    }

    res.status(200).json({ success: true, billboard });
  } catch (error) {
    console.error("Error fetching billboard details:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch billboard details",
      error: error.message,
    });
  }
};

module.exports = { addBillboard, getBillboards, getBillboardDetail };
