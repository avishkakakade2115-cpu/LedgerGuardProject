
import { useState } from "react";
import {
  registerOrganization,
  type CompanySize,
  type RegisterOrganizationResponse,
} from "../services/api";
import "../styles/registration.css";

type OrganizationRegistrationProps = {
  onBack?: () => void;
  onSuccess?: () => void;
};

function OrganizationRegistration({
  onBack,
  onSuccess,
}: OrganizationRegistrationProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [companyDetails, setCompanyDetails] = useState({
    companyName: "",
    companyEmail: "",
    companyDomain: "",
    contactNumber: "",
    companySize: "" as CompanySize | "",
    companyAddress: "",
  });

  const [ownerDetails, setOwnerDetails] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredData, setRegisteredData] =
    useState<RegisterOrganizationResponse | null>(null);

  const handleCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setCompanyDetails((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setOwnerDetails((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};

    const name = companyDetails.companyName.trim();

    if (!name || name.length < 2 || name.length > 100) {
      errors.companyName =
        "Company name must be between 2 and 100 characters.";
    }

    const email = companyDetails.companyEmail.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.companyEmail =
        "Please enter a valid company email address.";
    }

    const domain = companyDetails.companyDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .split(/[\/?#]/)[0];

    if (
      !domain ||
      !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain)
    ) {
      errors.companyDomain =
        "Please enter a valid domain (e.g. acme.com).";
    }

    const phone = companyDetails.contactNumber.trim();
    const digits = phone.replace(/\D/g, "");

    if (
      !phone ||
      digits.length < 7 ||
      !/^\+?[0-9\s\-()]{7,25}$/.test(phone)
    ) {
      errors.contactNumber =
        "Please enter a valid phone number (at least 7 digits).";
    }

    if (!companyDetails.companySize) {
      errors.companySize = "Please select a company size.";
    }

    const address = companyDetails.companyAddress.trim();

    if (!address || address.length < 2) {
      errors.companyAddress = "Company address is required.";
    } else if (address.length > 300) {
      errors.companyAddress =
        "Company address must not exceed 300 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};

    const name = ownerDetails.ownerName.trim();

    if (!name || name.length < 2 || name.length > 100) {
      errors.ownerName =
        "Administrator name must be between 2 and 100 characters.";
    }

    const email = ownerDetails.ownerEmail.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.ownerEmail = "Please enter a valid email address.";
    }

    const password = ownerDetails.ownerPassword;

    if (!password || password.length < 8) {
      errors.ownerPassword =
        "Password must be at least 8 characters long.";
    }

    if (password !== ownerDetails.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextFromStep1 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = async () => {
    setServerError("");
    setLoading(true);

    try {
      const response = await registerOrganization({
        name: companyDetails.companyName.trim(),
        companyEmail: companyDetails.companyEmail.trim().toLowerCase(),
        companyDomain: companyDetails.companyDomain
          .trim()
          .toLowerCase()
          .replace(/^https?:\/\//, "")
          .split(/[\/?#]/)[0] || companyDetails.companyDomain.trim(),
        contactNumber: companyDetails.contactNumber.trim(),
        companySize: companyDetails.companySize as CompanySize,
        companyAddress: companyDetails.companyAddress.trim(),
        ownerName: ownerDetails.ownerName.trim(),
        ownerEmail: ownerDetails.ownerEmail.trim().toLowerCase(),
        ownerPassword: ownerDetails.ownerPassword,
      });

      setRegisteredData(response.data);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please check your information and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Registration success screen
  if (registeredData) {
    return (
      <div className="registration-page">
        <div className="registration-card">
          <div className="registration-success-card">
            <div className="success-badge">✓</div>

            <h2>Organization Registered Successfully!</h2>

            <p>
              Your company account and tenant database have been initialized.
              You can now sign in with your administrator credentials.
            </p>

            <div className="success-summary">
              <div>
                <strong>Organization:</strong>{" "}
                {registeredData.organizationName}
              </div>

              <div>
                <strong>Slug:</strong> {registeredData.slug}
              </div>

              <div>
                <strong>Administrator:</strong>{" "}
                {registeredData.owner.email}
              </div>

              <div>
                <strong>Status:</strong> Active
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={onSuccess || onBack}
            >
              Proceed to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-page">
      <div className="registration-card">
        <div className="registration-header">
          <h1>LedgerGuard</h1>
          <p>Create a new organization</p>
        </div>

        <div className="registration-progress">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`progress-step ${
                currentStep >= step ? "active" : ""
              }`}
            >
              <span>{step}</span>
              <p>
                {step === 1
                  ? "Company Details"
                  : step === 2
                  ? "Admin Account"
                  : "Review & Submit"}
              </p>
            </div>
          ))}
        </div>

        {serverError && (
          <div className="registration-error-banner" role="alert">
            {serverError}
          </div>
        )}

        {/* STEP 1: COMPANY DETAILS */}
        {currentStep === 1 && (
          <div className="registration-form">
            <h2>Company Details</h2>
            <p>Enter your organization's business details.</p>

            <label htmlFor="companyName">Company Name *</label>
            <input
              id="companyName"
              name="companyName"
              value={companyDetails.companyName}
              onChange={handleCompanyChange}
              placeholder="e.g. Acme Technologies"
              className={fieldErrors.companyName ? "input-error" : ""}
            />
            {fieldErrors.companyName && (
              <p className="field-error">{fieldErrors.companyName}</p>
            )}

            <label htmlFor="companyEmail">Official Company Email *</label>
            <input
              id="companyEmail"
              type="email"
              name="companyEmail"
              value={companyDetails.companyEmail}
              onChange={handleCompanyChange}
              placeholder="e.g. contact@acme.com"
              className={fieldErrors.companyEmail ? "input-error" : ""}
            />
            {fieldErrors.companyEmail && (
              <p className="field-error">{fieldErrors.companyEmail}</p>
            )}

            <label htmlFor="companyDomain">Company Domain *</label>
            <input
              id="companyDomain"
              name="companyDomain"
              value={companyDetails.companyDomain}
              onChange={handleCompanyChange}
              placeholder="e.g. acme.com"
              className={fieldErrors.companyDomain ? "input-error" : ""}
            />
            {fieldErrors.companyDomain && (
              <p className="field-error">{fieldErrors.companyDomain}</p>
            )}

            <label htmlFor="contactNumber">Contact Phone Number *</label>
            <input
              id="contactNumber"
              type="tel"
              name="contactNumber"
              value={companyDetails.contactNumber}
              onChange={handleCompanyChange}
              placeholder="e.g. +1 555-0199 or +91 9876543210"
              className={fieldErrors.contactNumber ? "input-error" : ""}
            />
            {fieldErrors.contactNumber && (
              <p className="field-error">{fieldErrors.contactNumber}</p>
            )}

            <label htmlFor="companySize">Company Size *</label>
            <select
              id="companySize"
              name="companySize"
              value={companyDetails.companySize}
              onChange={handleCompanyChange}
              className={fieldErrors.companySize ? "input-error" : ""}
            >
              <option value="">Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
            {fieldErrors.companySize && (
              <p className="field-error">{fieldErrors.companySize}</p>
            )}

            <label htmlFor="companyAddress">Company Address *</label>
            <input
              id="companyAddress"
              name="companyAddress"
              value={companyDetails.companyAddress}
              onChange={handleCompanyChange}
              placeholder="e.g. 100 Financial Way, Suite 400"
              className={fieldErrors.companyAddress ? "input-error" : ""}
            />
            {fieldErrors.companyAddress && (
              <p className="field-error">{fieldErrors.companyAddress}</p>
            )}

            <div className="form-buttons">
              {onBack && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onBack}
                >
                  Cancel
                </button>
              )}

              <button
                type="button"
                className="btn-primary"
                onClick={handleNextFromStep1}
              >
                Continue to Admin Account
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ADMIN/OWNER ACCOUNT */}
        {currentStep === 2 && (
          <div className="registration-form">
            <h2>Administrator Account</h2>
            <p>Create the initial owner credentials for your company.</p>

            <label htmlFor="ownerName">Administrator Full Name *</label>
            <input
              id="ownerName"
              name="ownerName"
              value={ownerDetails.ownerName}
              onChange={handleOwnerChange}
              placeholder="e.g. John Doe"
              className={fieldErrors.ownerName ? "input-error" : ""}
            />
            {fieldErrors.ownerName && (
              <p className="field-error">{fieldErrors.ownerName}</p>
            )}

            <label htmlFor="ownerEmail">Login Email Address *</label>
            <input
              id="ownerEmail"
              type="email"
              name="ownerEmail"
              value={ownerDetails.ownerEmail}
              onChange={handleOwnerChange}
              placeholder="e.g. john@acme.com"
              className={fieldErrors.ownerEmail ? "input-error" : ""}
            />
            {fieldErrors.ownerEmail && (
              <p className="field-error">{fieldErrors.ownerEmail}</p>
            )}

            <label htmlFor="ownerPassword">
              Password (Min. 8 characters) *
            </label>

            <div className="password-input-group">
              <input
                id="ownerPassword"
                type={showPassword ? "text" : "password"}
                name="ownerPassword"
                value={ownerDetails.ownerPassword}
                onChange={handleOwnerChange}
                placeholder="Enter password"
                className={fieldErrors.ownerPassword ? "input-error" : ""}
              />

              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {fieldErrors.ownerPassword && (
              <p className="field-error">{fieldErrors.ownerPassword}</p>
            )}

            <label htmlFor="confirmPassword">Confirm Password *</label>

            <div className="password-input-group">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={ownerDetails.confirmPassword}
                onChange={handleOwnerChange}
                placeholder="Re-enter password"
                className={fieldErrors.confirmPassword ? "input-error" : ""}
              />

              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {fieldErrors.confirmPassword && (
              <p className="field-error">{fieldErrors.confirmPassword}</p>
            )}

            <div className="form-buttons">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setFieldErrors({});
                  setCurrentStep(1);
                }}
              >
                Back
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleNextFromStep2}
              >
                Continue to Review
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & SUBMIT */}
        {currentStep === 3 && (
          <div className="registration-form">
            <h2>Review Organization Details</h2>
            <p>
              Please confirm all information before creating the organization.
            </p>

            <div className="review-section">
              <div className="review-section-header">
                <h3>Company Information</h3>
                <button
                  type="button"
                  className="btn-edit-step"
                  onClick={() => setCurrentStep(1)}
                >
                  Edit
                </button>
              </div>

              <div className="review-grid">
                <div className="review-item">
                  <span className="review-label">Company Name</span>
                  <span className="review-value">
                    {companyDetails.companyName}
                  </span>
                </div>

                <div className="review-item">
                  <span className="review-label">Official Email</span>
                  <span className="review-value">
                    {companyDetails.companyEmail}
                  </span>
                </div>

                <div className="review-item">
                  <span className="review-label">Domain</span>
                  <span className="review-value">
                    {companyDetails.companyDomain}
                  </span>
                </div>

                <div className="review-item">
                  <span className="review-label">Contact Phone</span>
                  <span className="review-value">
                    {companyDetails.contactNumber}
                  </span>
                </div>

                <div className="review-item">
                  <span className="review-label">Company Size</span>
                  <span className="review-value">
                    {companyDetails.companySize} employees
                  </span>
                </div>

                <div className="review-item">
                  <span className="review-label">Address</span>
                  <span className="review-value">
                    {companyDetails.companyAddress}
                  </span>
                </div>
              </div>
            </div>

            <div className="review-section">
              <div className="review-section-header">
                <h3>Administrator Account</h3>
                <button
                  type="button"
                  className="btn-edit-step"
                  onClick={() => setCurrentStep(2)}
                >
                  Edit
                </button>
              </div>

              <div className="review-grid">
                <div className="review-item">
                  <span className="review-label">Administrator Name</span>
                  <span className="review-value">
                    {ownerDetails.ownerName}
                  </span>
                </div>

                <div className="review-item">
                  <span className="review-label">Login Email</span>
                  <span className="review-value">
                    {ownerDetails.ownerEmail}
                  </span>
                </div>

                <div className="review-item">
                  <span className="review-label">Password</span>
                  <span className="review-value">
                    •••••••• (Will be securely hashed)
                  </span>
                </div>
              </div>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                className="btn-secondary"
                disabled={loading}
                onClick={() => setCurrentStep(2)}
              >
                Back
              </button>

              <button
                type="button"
                className="btn-primary"
                disabled={loading}
                onClick={handleSubmit}
              >
                {loading
                  ? "Registering Organization..."
                  : "Register Organization"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizationRegistration;
