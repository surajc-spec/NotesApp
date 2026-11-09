const CommunityMessage = require('../models/communityMessage.model');
const userModel = require('../models/user.model');

/**
 * Fetch messages for the user's specific branch & semester.
 * Regular students are strictly locked into their own class group.
 * Admins can inspect any branch and semester group.
 */
async function getMessages(req, res) {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let targetBranch = user.branch;
    let targetSemester = user.semester;

    // Admin override: can inspect any group via query parameters
    if (user.role === 'admin') {
      if (req.query.branch) {
        targetBranch = req.query.branch;
      }
      if (req.query.semester) {
        targetSemester = Number(req.query.semester);
      }
    } else {
      // Strict student isolation: verify user has valid academic details
      if (!targetBranch || !targetSemester) {
        return res.status(403).json({
          message: 'Please set up your branch and semester in your profile to access your class community.',
          requiresProfileSetup: true,
        });
      }
    }

    const semNumber = Number(targetSemester);
    if (!Number.isInteger(semNumber) || semNumber < 1 || semNumber > 8) {
      return res.status(400).json({ message: 'Semester must be between 1 and 8' });
    }

    // Fetch up to 100 recent messages for this group
    const messages = await CommunityMessage.find({
      branch: new RegExp(`^${targetBranch.trim()}$`, 'i'),
      semester: semNumber,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      group: {
        branch: targetBranch,
        semester: semNumber,
      },
      // Reverse so oldest appears at top and latest at bottom of chat stream
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error('Error fetching community messages:', error);
    return res.status(500).json({ message: 'Failed to load community messages' });
  }
}

/**
 * Send a message into the community group.
 * Students can only post into their verified branch & semester.
 * Admins can post into any group and toggle announcements.
 */
async function postMessage(req, res) {
  try {
    const userId = req.user.id;
    const { content, isAnnouncement } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length > 1000) {
      return res.status(400).json({ message: 'Message cannot exceed 1000 characters' });
    }

    const user = await userModel.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let targetBranch = user.branch;
    let targetSemester = user.semester;

    // Admin can specify target branch and semester in payload
    if (user.role === 'admin') {
      if (req.body.branch) targetBranch = req.body.branch;
      if (req.body.semester) targetSemester = Number(req.body.semester);
    } else {
      // Regular student validation
      if (!targetBranch || !targetSemester) {
        return res.status(403).json({
          message: 'Please complete your profile to post in your class community.',
        });
      }
    }

    const semNumber = Number(targetSemester);
    if (!Number.isInteger(semNumber) || semNumber < 1 || semNumber > 8) {
      return res.status(400).json({ message: 'Semester must be between 1 and 8' });
    }

    const newMessage = await CommunityMessage.create({
      branch: targetBranch,
      semester: semNumber,
      sender: user._id,
      senderName: user.name,
      senderRole: user.role,
      content: trimmedContent,
      isAnnouncement: user.role === 'admin' && Boolean(isAnnouncement),
    });

    return res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('Error posting community message:', error);
    return res.status(500).json({ message: 'Failed to send message' });
  }
}

/**
 * Delete a message.
 * Users can delete their own messages. Admins can delete any message.
 */
async function deleteMessage(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await CommunityMessage.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only message author or admin can delete
    if (user.role !== 'admin' && String(message.sender) !== String(userId)) {
      return res.status(403).json({ message: 'You are not authorized to delete this message' });
    }

    await CommunityMessage.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    return res.status(500).json({ message: 'Failed to delete message' });
  }
}

/**
 * Admin only: Fetch summary of activity across all class channels
 */
async function getAdminChannels(req, res) {
  try {
    const summary = await CommunityMessage.aggregate([
      {
        $group: {
          _id: { branch: '$branch', semester: '$semester' },
          messageCount: { $sum: 1 },
          lastActivity: { $max: '$createdAt' },
        },
      },
      {
        $project: {
          _id: 0,
          branch: '$_id.branch',
          semester: '$_id.semester',
          messageCount: 1,
          lastActivity: 1,
        },
      },
      { $sort: { lastActivity: -1 } },
    ]);

    return res.status(200).json({ channels: summary });
  } catch (error) {
    console.error('Error fetching admin channel summary:', error);
    return res.status(500).json({ message: 'Failed to fetch channels' });
  }
}

module.exports = {
  getMessages,
  postMessage,
  deleteMessage,
  getAdminChannels,
};
