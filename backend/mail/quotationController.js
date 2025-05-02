const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter using Google App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'venkatsudarshan29@gmail.com',
    pass: 'nfthbioptqqxhyez'
  }
});


exports.sendQuotationRequest = async (req, res) => {
  try {
    const {
      billboard,
      user,
      startDate,
      endDate,
      budget,
      companyName,
      contactEmail,
      message
    } = req.body;

    // Validate required fields
    if (!billboard || !user || !startDate || !endDate || !contactEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Email content for billboard owner
    const ownerMailOptions = {
      from: `"Billboard Booking System" <${process.env.GMAIL_USER}>`,
      to: billboard.owner.email,
      subject: `New Quotation Request for Billboard at ${billboard.location}`,
      html: `
        <h2>New Quotation Request</h2>
        <h3>Billboard Details</h3>
        <p><strong>Location:</strong> ${billboard.location}</p>
        <p><strong>Address:</strong> ${billboard.address}</p>
        <p><strong>Size:</strong> ${billboard.size}</p>
        <p><strong>Type:</strong> ${billboard.type}</p>
        <p><strong>Price:</strong> ₹${billboard.price.toLocaleString()}/${billboard.priceUnit}</p>

        <h3>Request Details</h3>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Contact Email:</strong> ${contactEmail}</p>
        <p><strong>Requestor:</strong> ${user.name}</p>
        <p><strong>Booking Period:</strong> ${start.toLocaleDateString()} to ${end.toLocaleDateString()} (${diffDays} days)</p>
        <p><strong>Budget:</strong> ₹${parseInt(budget).toLocaleString()}</p>

        <h3>Additional Message</h3>
        <p>${message || 'No additional message provided'}</p>

        <hr>
        <p>Please respond to this request at your earliest convenience.</p>
      `
    };

    // Email content for user/requestor
    const userMailOptions = {
      from: `"Billboard Booking System" <${process.env.GMAIL_USER}>`,
      to: contactEmail,
      subject: `Your quotation request for ${billboard.location}`,
      html: `
        <h2>Thank you for your request!</h2>
        <p>We've received your quotation request for the billboard at <strong>${billboard.location}</strong>.</p>

        <h3>Request Summary</h3>
        <p><strong>Owner:</strong> ${billboard.owner.name}</p>
        <p><strong>Owner Email:</strong> ${billboard.owner.email}</p>
        <p><strong>Owner Phone:</strong> ${billboard.owner.phone}</p>
        <p><strong>Booking Period:</strong> ${start.toLocaleDateString()} to ${end.toLocaleDateString()} (${diffDays} days)</p>

        <p>The billboard owner has been notified and will contact you shortly.</p>

        <hr>
        <p>You can also reach out directly to the owner:</p>
        <p>Email: <a href="mailto:${billboard.owner.email}">${billboard.owner.email}</a></p>
        <p>Phone: <a href="tel:${billboard.owner.phone}">${billboard.owner.phone}</a></p>
      `
    };

    // Send both emails
    await transporter.sendMail(ownerMailOptions);
    await transporter.sendMail(userMailOptions);

    res.status(200).json({
      success: true,
      message: 'Quotation request sent successfully'
    });
  } catch (error) {
    console.error('Error sending quotation request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send quotation request',
      error: error.message
    });
  }
};
