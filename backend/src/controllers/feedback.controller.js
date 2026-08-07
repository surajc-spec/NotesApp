const feedbackModel = require('../models/feedback.model');
const userModel = require('../models/user.model');

/**
 * Submit feedback / testimonial
 */
async function submitFeedback(req, res) {
  try {
    const { rating, comment, name, branch, semester } = req.body;

    if (!rating || !comment || !comment.trim()) {
      return res.status(400).json({ message: 'Rating (1-5) and feedback comment are required' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 stars' });
    }

    let studentName = name;
    let studentBranch = branch;
    let studentSem = Number(semester);
    let userId = null;

    // If student is logged in, extract profile details
    if (req.user && req.user.id) {
      userId = req.user.id;
      const user = await userModel.findById(userId);
      if (user) {
        studentName = studentName || user.name;
        studentBranch = studentBranch || user.branch;
        studentSem = studentSem || user.semester;
      }
    }

    if (!studentName || !studentBranch || !studentSem) {
      return res.status(400).json({ message: 'Student name, branch, and semester are required' });
    }

    const feedback = await feedbackModel.create({
      user: userId,
      name: studentName.trim(),
      branch: studentBranch.trim(),
      semester: studentSem,
      rating: numRating,
      comment: comment.trim(),
      isApproved: true, // Default approved
      isFeatured: numRating === 5, // Auto-feature 5-star reviews
    });

    return res.status(201).json({
      message: 'Thank you for your feedback! Your review has been submitted successfully.',
      feedback,
    });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
    return res.status(500).json({ message: 'Failed to submit feedback. Please try again.' });
  }
}

/**
 * Get public testimonials for homepage
 */
async function getPublicTestimonials(req, res) {
  try {
    const testimonials = await feedbackModel
      .find({ isApproved: true })
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(10)
      .lean();

    return res.status(200).json({
      message: 'Testimonials fetched successfully',
      count: testimonials.length,
      testimonials,
    });
  } catch (error) {
    console.error('Get Testimonials Error:', error);
    return res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
}

module.exports = {
  submitFeedback,
  getPublicTestimonials,
};
