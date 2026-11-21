
import { useState } from "react";
import "../styles/registration.css";

type CompanyDetails = {
  companyName: string;
  companyEmail: string;
  companyDomain: string;
  contactNumber: string;
  companySize: string;
  companyAddress: string;
};

type AdminDetails = {
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  confirmPassword: string;
};

function OrganizationRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  const [companyDetails, setCompanyDetails] =
    useState<CompanyDetails>({
      companyName: "",
      companyEmail: "",
      companyDomain: "",
      contactNumber: "",
      companySize: "",
      companyAddress: "",
    });

  const [adminDetails, setAdminDetails] =
    useState<AdminDetails>({
      ownerName: "",
      ownerEmail: "",
      ownerPassword: "",
      confirmPassword: "",
    });

  const handleCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setCompanyDetails((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage("");
  };

  const handleAdminChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAdminDetails((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
    setErrorMessage("");
  };

  const handleNext = () => {
    setErrorMessage("");

    if (currentStep === 1) {
      const {
        companyName,
        companyEmail,
        companyDomain,
        companyAddress,
        companySize,
      } = companyDetails;

      if (
        !companyName.trim() ||
        !companyEmail.trim() ||
        !companyDomain.trim() ||
        !companyAddress.trim() ||
        !companySize
      ) {
        setErrorMessage("Please complete all company details.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) {
        setErrorMessage("Please enter a valid company email.");
        return;
      }
    }

    if (currentStep === 2) {
      const {
        ownerName,
        ownerEmail,
        ownerPassword,
        confirmPassword,
      } = adminDetails;

      if (
        !ownerName.trim() ||
        !ownerEmail.trim() ||
        !ownerPassword ||
        !confirmPassword
      ) {
        setErrorMessage("Please complete all admin account details.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
        setErrorMessage("Please enter a valid admin email.");
        return;
      }

      if (ownerPassword.length < 8) {
        setErrorMessage(
          "Password must contain at least 8 characters."
        );
        return;
      }

      if (ownerPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }
    }

    setCurrentStep((previous) => Math.min(previous + 1, 3));
  };

  const handleBack = () => {
    setErrorMessage("");
    setCurrentStep((previous) => Math.max(previous - 1, 1));
  };

  return (
    <div className="registration-page">
      <div className="registration-card">

        <div className="registration-header">
          <h1>LedgerGuard</h1>
          <p>Create a new organization</p>
        </div>

        {/* Registration Progress */}
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
                  : "Review"}
              </p>
            </div>
          ))}
        </div>

        {errorMessage && (
          <div className="registration-error" role="alert">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: COMPANY DETAILS */}
        {currentStep === 1 && (
          <div className="registration-form">
            <h2>Company Details</h2>
            <p>Enter your organization's information.</p>

            <label>Company Name *</label>
            <input
              name="companyName"
              value={companyDetails.companyName}
              onChange={handleCompanyChange}
              placeholder="Enter company name"
            />

            <label>Official Company Email *</label>
            <input
              type="email"
              name="companyEmail"
              value={companyDetails.companyEmail}
              onChange={handleCompanyChange}
              placeholder="admin@company.com"
            />

            <label>Company Domain *</label>
            <input
              name="companyDomain"
              value={companyDetails.companyDomain}
              onChange={handleCompanyChange}
              placeholder="company.com"
            />

            <label>Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={companyDetails.contactNumber}
              onChange={handleCompanyChange}
              placeholder="Enter contact number"
            />

            <label>Company Size *</label>
            <select
              name="companySize"
              value={companyDetails.companySize}
              onChange={handleCompanyChange}
            >
              <option value="">Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>

            <label>Company Address *</label>
            <input
              name="companyAddress"
              value={companyDetails.companyAddress}
              onChange={handleCompanyChange}
              placeholder="Enter company address"
            />

            <button type="button" onClick={handleNext}>
              Continue
            </button>
          </div>
        )}

        {/* STEP 2: ADMIN ACCOUNT */}
        {currentStep === 2 && (
          <div className="registration-form">
            <h2>Admin Account</h2>
            <p>Create the primary administrator account.</p>

            <label>Admin Full Name *</label>
            <input
              name="ownerName"
              value={adminDetails.ownerName}
              onChange={handleAdminChange}
              placeholder="Enter admin full name"
            />

            <label>Admin Email Address *</label>
            <input
              type="email"
              name="ownerEmail"
              value={adminDetails.ownerEmail}
              onChange={handleAdminChange}
              placeholder="admin@company.com"
            />

            <label>Create Password *</label>
            <input
              type="password"
              name="ownerPassword"
              value={adminDetails.ownerPassword}
              onChange={handleAdminChange}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
            />

            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={adminDetails.confirmPassword}
              onChange={handleAdminChange}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />

            <div className="registration-actions">
              <button
                type="button"
                className="secondary"
                onClick={handleBack}
              >
                Back
              </button>

              <button type="button" onClick={handleNext}>
                Continue
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW */}
        {currentStep === 3 && (
          <div className="registration-form">
            <h2>Review Your Details</h2>
            <p>Please verify your information before submitting.</p>

            <div className="registration-review">
              <h3>Company Information</h3>

              <p><strong>Company:</strong> {companyDetails.companyName}</p>
              <p><strong>Email:</strong> {companyDetails.companyEmail}</p>
              <p><strong>Domain:</strong> {companyDetails.companyDomain}</p>
              <p><strong>Contact:</strong> {companyDetails.contactNumber || "Not provided"}</p>
              <p><strong>Company Size:</strong> {companyDetails.companySize}</p>
              <p><strong>Address:</strong> {companyDetails.companyAddress}</p>

              <h3>Administrator Information</h3>

              <p><strong>Admin Name:</strong> {adminDetails.ownerName}</p>
              <p><strong>Admin Email:</strong> {adminDetails.ownerEmail}</p>
              <p><strong>Password:</strong> ••••••••</p>
            </div>

            <div className="registration-pending">
              Registration submission will be enabled after
              confirmation of the backend API contract.
            </div>

            <div className="registration-actions">
              <button
                type="button"
                className="secondary"
                onClick={handleBack}
              >
                Back
              </button>

              <button type="button" disabled>
                Submit Registration
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default OrganizationRegistration;
