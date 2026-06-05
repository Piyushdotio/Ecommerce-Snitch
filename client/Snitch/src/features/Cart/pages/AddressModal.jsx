import React, { useEffect, useState } from "react";
import { useAddress } from "../hook/useAddress";
import "./AddressModal.scss";

const AddressModal = ({ onClose, onDeliverHere, checkoutError }) => {
  const {
    addresses,
    loading,
    error: apiError,
    fetchAddresses,
    handleAddAddress,
    handleDeleteAddress,
    handleSetDefaultAddress,
  } = useAddress();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // New address form state
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  useEffect(() => {
    const loadAddresses = async () => {
      const list = await fetchAddresses();
      if (list && list.length > 0) {
        // Find default or fallback to first
        const def = list.find((addr) => addr.isDefault);
        setSelectedAddressId(def ? def._id : list[0]._id);
      } else {
        // If no addresses, automatically show the "Add New Address" form
        setIsAddingNew(true);
      }
    };
    loadAddresses();
  }, [fetchAddresses]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!formData.fullname.trim()) return "Full name is required";
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.trim())) {
      return "Valid 10-digit phone number is required";
    }
    if (!formData.line1.trim()) return "Address line 1 is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State is required";
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) {
      return "Valid 6-digit Pincode is required";
    }
    return null;
  };

  const handleAddNewSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const validationMsg = validateForm();
    if (validationMsg) {
      setLocalError(validationMsg);
      return;
    }

    if (saveToProfile) {
      const result = await handleAddAddress(formData);
      if (result.success) {
        // Find the newly added address in the list to select it
        const newAddr = result.addresses[result.addresses.length - 1];
        if (newAddr) {
          setSelectedAddressId(newAddr._id);
        }
        setIsAddingNew(false);
        resetForm();
      } else {
        setLocalError(result.message || "Failed to save address to profile");
      }
    } else {
      // Just deliver to this temporary address without saving
      setLocalError(null);
      setIsProcessing(true);
      try {
        await onDeliverHere(formData);
      } catch (err) {
        setLocalError(err.message || "Failed to start checkout");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      fullname: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
    setLocalError(null);
  };

  const handleDeliver = async () => {
    setLocalError(null);
    setIsProcessing(true);
    try {
      if (isAddingNew) {
        // If user is currently adding an address, they should submit the form first
        const validationMsg = validateForm();
        if (validationMsg) {
          setLocalError(validationMsg);
          setIsProcessing(false);
          return;
        }
        await onDeliverHere(formData);
      } else {
        const selected = addresses.find((addr) => addr._id === selectedAddressId);
        if (!selected) {
          setLocalError("Please select a delivery address");
          setIsProcessing(false);
          return;
        }
        await onDeliverHere(selected);
      }
    } catch (err) {
      setLocalError(err.message || "Failed to start checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this address?")) {
      const result = await handleDeleteAddress(id);
      if (result.success) {
        if (selectedAddressId === id) {
          const remaining = result.addresses;
          if (remaining && remaining.length > 0) {
            const def = remaining.find((addr) => addr.isDefault);
            setSelectedAddressId(def ? def._id : remaining[0]._id);
          } else {
            setSelectedAddressId(null);
            setIsAddingNew(true);
          }
        }
      }
    }
  };

  const handleSetDefault = async (e, id) => {
    e.stopPropagation();
    await handleSetDefaultAddress(id);
  };

  const combinedError = localError || apiError || checkoutError;

  return (
    <div className="address-overlay" onClick={onClose}>
      <div className="address-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="address-modal__header">
          <h2 className="address-modal__title">Delivery Address</h2>
          <button className="address-modal__close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Error notification */}
        {combinedError && (
          <div className="address-modal__error">
            <span className="material-symbols-outlined">error</span>
            <p>{combinedError}</p>
          </div>
        )}

        {/* Content Container */}
        <div className="address-modal__body">
          {loading && addresses.length === 0 ? (
            <div className="address-modal__skeleton-container">
              <div className="address-skeleton-card"></div>
              <div className="address-skeleton-card"></div>
            </div>
          ) : (
            <>
              {/* SAVED ADDRESSES LIST */}
              {!isAddingNew && addresses.length > 0 && (
                <div className="address-list">
                  <p className="address-list__subtitle">Select a saved address:</p>
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        className={`address-card ${isSelected ? "address-card--selected" : ""}`}
                        onClick={() => setSelectedAddressId(addr._id)}
                      >
                        <div className="address-card__radio">
                          <div className={`radio-dot ${isSelected ? "radio-dot--active" : ""}`}></div>
                        </div>
                        <div className="address-card__content">
                          <div className="address-card__header-row">
                            <span className="address-card__name">{addr.fullname}</span>
                            {addr.isDefault && (
                              <span className="address-card__badge">Default</span>
                            )}
                          </div>
                          <p className="address-card__details">
                            {addr.line1}
                            {addr.line2 && `, ${addr.line2}`}
                            <br />
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <span className="address-card__phone">
                            Phone: {addr.phone}
                          </span>

                          <div className="address-card__actions">
                            {!addr.isDefault && (
                              <button
                                className="address-card__action-btn"
                                onClick={(e) => handleSetDefault(e, addr._id)}
                              >
                                Set as default
                              </button>
                            )}
                            <button
                              className="address-card__action-btn address-card__action-btn--danger"
                              onClick={(e) => handleRemove(e, addr._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ADD NEW ADDRESS FORM */}
              {isAddingNew ? (
                <form className="address-form" onSubmit={handleAddNewSubmit}>
                  <h3 className="address-form__title">Add Delivery Address</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="fullname">Full Name *</label>
                      <input
                        type="text"
                        id="fullname"
                        name="fullname"
                        placeholder="John Doe"
                        value={formData.fullname}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number (10 digit) *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group form-group--full">
                      <label htmlFor="line1">Address Line 1 (Flat, House, Street) *</label>
                      <input
                        type="text"
                        id="line1"
                        name="line1"
                        placeholder="123 Main St, Apartment 4B"
                        value={formData.line1}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group form-group--full">
                      <label htmlFor="line2">Address Line 2 (Landmark, Area) (Optional)</label>
                      <input
                        type="text"
                        id="line2"
                        name="line2"
                        placeholder="Near Metro Station"
                        value={formData.line2}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="city">City *</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        placeholder="New Delhi"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State *</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        placeholder="Delhi"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pincode">Pincode *</label>
                      <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        placeholder="110001"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-options">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                      />
                      Set as default address
                    </label>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="saveToProfile"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                      />
                      Save address to profile
                    </label>
                  </div>

                  <div className="form-actions">
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setIsAddingNew(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary">
                      {saveToProfile ? "Save & Select" : "Proceed with this address"}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  className="add-new-trigger"
                  onClick={() => setIsAddingNew(true)}
                >
                  <span className="material-symbols-outlined">add</span>
                  Add New Address
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer actions */}
        {!isAddingNew && (
          <div className="address-modal__footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading || isProcessing}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleDeliver}
              disabled={loading || isProcessing || (!selectedAddressId && addresses.length > 0)}
            >
              {isProcessing ? "Processing..." : loading ? "Loading..." : "Deliver Here"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressModal;
