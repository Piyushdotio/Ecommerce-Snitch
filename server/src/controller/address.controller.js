import userModel from "../models/userSchema.model.js";

/**
 * GET /api/auth/addresses
 * Get all saved addresses for the authenticated user
 */
export const getAddresses = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Addresses fetched successfully",
      addresses: user.addresses || []
    });
  } catch (error) {
    console.error("getAddresses error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch addresses"
    });
  }
};

/**
 * POST /api/auth/addresses
 * Add a new address to the user's saved addresses
 */
export const addAddress = async (req, res) => {
  try {
    const { fullname, phone, line1, line2, city, state, pincode, isDefault } = req.body;
    if (!fullname || !phone || !line1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If this is the user's first address, make it default
    const shouldBeDefault = user.addresses.length === 0 ? true : !!isDefault;

    if (shouldBeDefault) {
      // Set all other addresses isDefault to false
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      fullname,
      phone,
      line1,
      line2: line2 || "",
      city,
      state,
      pincode,
      isDefault: shouldBeDefault
    };

    user.addresses.push(newAddress);
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("addAddress error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add address"
    });
  }
};

/**
 * DELETE /api/auth/addresses/:addressId
 * Delete a saved address
 */
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If default was deleted and we still have addresses left, make the first one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("deleteAddress error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete address"
    });
  }
};

/**
 * PATCH /api/auth/addresses/:addressId/default
 * Set a saved address as the default address
 */
export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let addressFound = false;
    user.addresses.forEach(addr => {
      if (addr._id.toString() === addressId) {
        addr.isDefault = true;
        addressFound = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!addressFound) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      addresses: user.addresses
    });
  } catch (error) {
    console.error("setDefaultAddress error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to set default address"
    });
  }
};
