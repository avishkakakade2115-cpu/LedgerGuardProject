
import { useState, type FormEvent } from "react";
import { loginUser, registerOrganization } from "../services/api";
import "../styles/registration.css";

type OrganizationRegistrationProps = {
  onRegistrationSuccess: () => void;
};

function OrganizationRegistration({
  onRegistrationSuccess,
}: OrganizationRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const [companyDetails, setCompanyDetails] = useState({
    companyName: "",
    companyEmail: "",
    companyDomain: "",
    contactNumber: "",
    companySize: "",
    companyAddress: "",
  });

  const [adminDetails, setAdminDetails] = useState({
    ownerName: "",
    ownerPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdminChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdminDetails({
      ...adminDetails,
      [event.target.name]: event.target.value,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setCompanyDetails({
      ...companyDetails,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (adminDetails.ownerPassword !== adminDetails.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerOrganization({
        name: companyDetails.companyName.trim(),
        ownerName: adminDetails.ownerName.trim(),
        ownerEmail: companyDetails.companyEmail.trim(),
        ownerPassword: adminDetails.ownerPassword,
      });

      await loginUser(
        companyDetails.companyEmail.trim(),
        adminDetails.ownerPassword
      );

      onRegistrationSuccess();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Organization registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      <form className="registration-card" onSubmit={handleSubmit}>
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
                  : "Review"}
              </p>
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <div className="registration-form">
            <h2>Company Details</h2>
            <p>Enter your organization's information.</p>

            <label>Company Name</label>
            <input
              name="companyName"
              value={companyDetails.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              required
            />

            <label>Official Company Email</label>
            <input
              type="email"
              name="companyEmail"
              value={companyDetails.companyEmail}
              onChange={handleChange}
              placeholder="admin@company.com"
              required
            />

            <label>Company Domain</label>
            <input
              name="companyDomain"
              value={companyDetails.companyDomain}
              onChange={handleChange}
              placeholder="company.com"
              required
            />

            <label>Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={companyDetails.contactNumber}
              onChange={handleChange}
              placeholder="Enter contact number"
              required
            />

            <label>Company Size</label>
            <select
              name="companySize"
              value={companyDetails.companySize}
              onChange={handleChange}
            >
              <option value="">Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>

            <label>Company Address</label>
            <input
              name="companyAddress"
              value={companyDetails.companyAddress}
              onChange={handleChange}
              placeholder="Enter company address"
              required
            />

            <button type="button" onClick={handleNext}>
              Continue
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="registration-form">
            <h2>Admin Account</h2>
            <p>These credentials will be used to sign in as the organization owner.</p>

            <label>Admin Name</label>
            <input
              name="ownerName"
              value={adminDetails.ownerName}
              onChange={handleAdminChange}
              placeholder="Enter admin name"
              required
            />

            <label>Admin Email</label>
            <input
              type="email"
              value={companyDetails.companyEmail}
              placeholder="admin@company.com"
              readOnly
            />

            <label>Password</label>
            <input
              type="password"
              name="ownerPassword"
              value={adminDetails.ownerPassword}
              onChange={handleAdminChange}
              minLength={8}
              autoComplete="new-password"
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={adminDetails.confirmPassword}
              onChange={handleAdminChange}
              minLength={8}
              autoComplete="new-password"
              required
            />

            {errorMessage && (
              <p className="registration-error" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="registration-actions">
              <button type="button" onClick={handleBack}>
                Back
              </button>
              <button type="button" onClick={handleNext}>
                Continue
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="registration-form">
            <h2>Review</h2>
            <p>Confirm your organization and admin account details.</p>

            <div className="registration-review">
              <p><strong>Organization:</strong> {companyDetails.companyName}</p>
              <p><strong>Domain:</strong> {companyDetails.companyDomain}</p>
              <p><strong>Admin name:</strong> {adminDetails.ownerName}</p>
              <p><strong>Admin email:</strong> {companyDetails.companyEmail}</p>
            </div>

            {errorMessage && (
              <p className="registration-error" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="registration-actions">
              <button type="button" onClick={handleBack} disabled={loading}>
                Back
              </button>
              <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Organization"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default OrganizationRegistration;
