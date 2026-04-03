const prisma = require('../utils/db');

// @desc    Get public site settings
// @route   GET /v1/settings
// @access  Public
const getSiteSettings = async (req, res) => {
  try {
    let settings = await prisma.siteSettings.findFirst();

    // If no settings exist yet, create default settings
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          isMaintenance: false
        }
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('[Get Settings Error]:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Toggle maintenance mode
// @route   PUT /v1/settings/maintenance
// @access  Private/Admin
const toggleMaintenance = async (req, res) => {
  try {
    const { isMaintenance, maintenanceMsg } = req.body;
    
    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { isMaintenance, maintenanceMsg }
      });
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: { 
          isMaintenance: isMaintenance !== undefined ? isMaintenance : settings.isMaintenance,
          maintenanceMsg: maintenanceMsg !== undefined ? maintenanceMsg : settings.maintenanceMsg
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث حالة الموقع بنجاح',
      data: settings
    });
  } catch (error) {
    console.error('[Toggle Maintenance Error]:', error);
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getSiteSettings,
  toggleMaintenance
};
