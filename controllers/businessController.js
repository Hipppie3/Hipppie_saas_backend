import Business from '../models/business.js';

// ✅ Allow all users
export const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.findAll();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
};

export const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findByPk(req.params.id);
    if (!business) return res.status(404).json({ error: 'Business not found' });
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch business' });
  }
};

// ✅ Only super_admin
export const createBusiness = async (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const business = await Business.create(req.body);
    res.status(201).json(business);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create business' });
  }
};

export const updateBusiness = async (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const business = await Business.findByPk(req.params.id);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    await business.update(req.body);
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update business' });
  }
};

export const deleteBusiness = async (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const business = await Business.findByPk(req.params.id);
    if (!business) return res.status(404).json({ error: 'Business not found' });

    await business.destroy();
    res.json({ message: 'Business deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete business' });
  }
};
