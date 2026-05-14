const express = require('express');
const auth = require('../middleware/auth');
const Address = require('../models/Address');
const addressRepo = require('../repositories/addressRepo');

const router = express.Router();
const isMssql = (process.env.DB_PROVIDER || 'mongo').toLowerCase() === 'mssql';

// Apply auth middleware to all routes
router.use(auth);

// Get all addresses for a user
router.get('/', async (req, res) => {
  try {
    if (isMssql) {
      const addresses = await addressRepo.getByOwner(req.userId);
      return res.json(addresses);
    }
    const addresses = await Address.find({ owner: req.user._id })
      .sort({ isDefault: -1, createdAt: -1 });
    
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get address by ID
router.get('/:id', async (req, res) => {
  try {
    if (isMssql) {
      const address = await addressRepo.getAddressById(req.params.id);
      if (!address) return res.status(404).json({ message: 'Address not found' });
      // Check ownership
      if (req.user.role !== 'admin' && address.ownerId !== req.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      return res.json(address);
    }

    let address;
    
    // If user is admin, they can access any address
    if (req.user.role === 'admin') {
      address = await Address.findById(req.params.id);
    } else {
      // Regular users can only access their own addresses
      address = await Address.findOne({ 
        _id: req.params.id, 
        owner: req.user._id 
      });
    }
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new address
router.post('/', async (req, res) => {
  try {
    const addressData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Set owner - if admin is creating for another user, allow specifying owner
    if (req.user.role === 'admin' && req.body.owner) {
      addressData.owner = req.body.owner;
    } else {
      addressData.owner = req.userId;
    }

    if (isMssql) {
      if (addressData.isDefault) {
        await addressRepo.unsetOtherDefaults(addressData.owner, 'NONE');
      }
      const address = await addressRepo.createAddress(addressData);
      return res.status(201).json({ message: 'Address created successfully', address });
    }

    const address = new Address(addressData);
    await address.save();

    res.status(201).json({ message: 'Address created successfully', address });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update address
router.put('/:id', async (req, res) => {
  try {
    if (isMssql) {
      const address = await addressRepo.getAddressById(req.params.id);
      if (!address) return res.status(404).json({ message: 'Address not found' });
      if (req.user.role !== 'admin' && address.ownerId !== req.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (req.body.isDefault) {
        await addressRepo.unsetOtherDefaults(address.ownerId, req.params.id);
      }
      const updated = await addressRepo.updateAddress(req.params.id, req.body);
      return res.json({ message: 'Address updated successfully', address: updated });
    }

    let address;
    
    // If user is admin, they can update any address
    if (req.user.role === 'admin') {
      address = await Address.findById(req.params.id);
    } else {
      // Regular users can only update their own addresses
      address = await Address.findOne({ 
        _id: req.params.id, 
        owner: req.user._id 
      });
    }
    
    if (!address) {
      console.error('Update failed: Address not found for ID', req.params.id);
      return res.status(404).json({ message: 'Address not found' });
    }

    // If setting as default, unset other default addresses
    if (req.body.isDefault) {
      await Address.updateMany(
        { owner: address.owner, _id: { $ne: req.params.id }, isDefault: true },
        { isDefault: false }
      );
    }

    // Explicitly set fields to avoid Mongoose nested object issues
    if (req.body.street) address.street = req.body.street;
    if (req.body.ward) address.ward = req.body.ward;
    if (req.body.province) address.province = req.body.province;
    if (req.body.fullAddress) address.fullAddress = req.body.fullAddress;
    if (req.body.isDefault !== undefined) address.isDefault = req.body.isDefault;
    if (req.body.addressType) address.addressType = req.body.addressType;
    if (req.body.metadata) address.metadata = req.body.metadata;
    if (req.body.referenceType) address.referenceType = req.body.referenceType;
    if (req.body.referenceId) address.referenceId = req.body.referenceId;
    if (req.body.owner) address.owner = req.body.owner;
    
    address.updatedAt = new Date();
    await address.save();

    res.json({ message: 'Address updated successfully', address });
  } catch (error) {
    console.error('CRITICAL: Address Update Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message: 'Lỗi xác thực: ' + messages, errors: error.errors });
    }
    res.status(500).json({ message: error.message });
  }
});

// Delete address
router.delete('/:id', async (req, res) => {
  try {
    if (isMssql) {
      await addressRepo.deleteAddress(req.params.id);
      return res.json({ message: 'Address deleted successfully' });
    }
    let address;
    
    // If user is admin, they can delete any address
    if (req.user.role === 'admin') {
      address = await Address.findById(req.params.id);
    } else {
      // Regular users can only delete their own addresses
      address = await Address.findOne({ 
        _id: req.params.id, 
        owner: req.user._id 
      });
    }
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Set default address
router.put('/:id/default', async (req, res) => {
  try {
    if (isMssql) {
      const address = await addressRepo.getAddressById(req.params.id);
      if (!address) return res.status(404).json({ message: 'Address not found' });
      if (address.ownerId !== req.userId) return res.status(403).json({ message: 'Access denied' });
      
      await addressRepo.unsetOtherDefaults(req.userId, req.params.id);
      const updated = await addressRepo.updateAddress(req.params.id, { isDefault: true });
      return res.json({ message: 'Default address updated successfully', address: updated });
    }

    const address = await Address.findOne({ 
      _id: req.params.id, 
      owner: req.user._id 
    });
    
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Unset all other default addresses
    await Address.updateMany(
      { owner: req.user._id, isDefault: true },
      { isDefault: false }
    );

    // Set this as default
    await Address.findByIdAndUpdate(
      req.params.id,
      { isDefault: true }
    );

    res.json({ message: 'Default address updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get default address
router.get('/default', async (req, res) => {
  try {
    if (isMssql) {
      const addresses = await addressRepo.getByOwner(req.userId);
      const def = addresses.find(a => a.isDefault) || addresses[0] || null;
      return res.json(def);
    }
    const address = await Address.findOne({ 
      owner: req.user._id, 
      isDefault: true 
    });
    
    if (!address) {
      // If no default, return the first address
      const firstAddress = await Address.findOne({ 
        owner: req.user._id 
      }).sort({ createdAt: 1 });
      
      return res.json(firstAddress);
    }
    
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
