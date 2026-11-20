
import { useState, type FormEvent } from "react";
import { apiRequest } from "../services/api";
import "../styles/registration.css";

function OrganizationRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [companyDetails, setCompanyDetails] = useState({
    companyName: "",
    companyEmail: "",
    companyDomain: "",
    contactNumber: "",
    companySize: "",
    companyAddress: "",
  });

  const [adminDetails, setAdminDetails] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setCompanyDetails({
      ...companyDetails,
      [event.target.name]: event.target.value,
    });
    setErrorMessage("");
  };

  const handleAdminChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAdminDetails({
      ...adminDetails,
      [event.target.name]: event.target.value,
    });
    setErrorMessage("");
  };

  const validateCompanyDetails = () => {
    if (
      !companyDetails.companyName.trim() ||
      !companyDetails.companyEmail.trim() ||
      !companyDetails.companyDomain.trim() ||
      !companyDetails.contactNumber.trim() ||
      !companyDetails.companySize ||
      !companyDetails.companyAddress.trim()
    ) {
      setErrorMessage("Please complete all company details.");
      return false;
    }

    return true;
  };

  const validateAdminDetails = () => {
    if (
      !adminDetails.fullName.trim() ||
      !adminDetails.email.trim() ||
      !adminDetails.password ||
      !adminDetails.confirmPassword
    ) {
      setErrorMessage("Please complete all administrator account fields.");
      return false;
    }

    if (adminDetails.password !== adminDetails.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return false;
    }

    if (adminDetails.password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setErrorMessage("");

    if (currentStep === 1 && !validateCompanyDetails()) return;
    if (currentStep === 2 && !validateAdminDetails()) return;

    setCurrentStep((step) => Math.min(step + 1, 3));
  };

  const handleBack = () => {
    setErrorMessage("");
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await apiRequest("/organizations", {
        method: "POST",
        body: JSON.stringify({
          name: companyDetails.companyName.trim(),
        }),
      });

      setSuccessMessage(
        `${companyDetails.companyName.trim()} has been registered successfully.`
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to register the organization"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  : "Review"}
              </p>
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <form className="registration-form" onSubmit={(event) => {
            event.preventDefault();
            handleNext();
          }}>
            <h2>Company Details</h2>
            <p>Enter your organization's information.</p>

            <label htmlFor="companyName">Company Name</label>
            <input
              id="companyName"
              name="companyName"
              value={companyDetails.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
              required
            />

            <label htmlFor="companyEmail">Official Company Email</label>
            <input
              type="email"
              id="companyEmail"
              name="companyEmail"
              value={companyDetails.companyEmail}
              onChange={handleChange}
              placeholder="admin@company.com"
              required
            />

            <label htmlFor="companyDomain">Company Domain</label>
            <input
              id="companyDomain"
              name="companyDomain"
              value={companyDetails.companyDomain}
              onChange={handleChange}
              placeholder="company.com"
              required
            />

            <label htmlFor="contactNumber">Contact Number</label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={companyDetails.contactNumber}
              onChange={handleChange}
              placeholder="Enter contact number"
              required
            />

            <label htmlFor="companySize">Company Size</label>
            <select
              id="companySize"
              name="companySize"
              value={companyDetails.companySize}
              onChange={handleChange}
              required
            >
              <option value="">Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>

            <label htmlFor="companyAddress">Company Address</label>
            <input
              id="companyAddress"
              name="companyAddress"
              value={companyDetails.companyAddress}
              onChange={handleChange}
              placeholder="Enter company address"
              required
            />

            {errorMessage && <p className="registration-error" role="alert">{errorMessage}</p>}
            <button type="submit">Continue</button>
          </form>
        )}

        {currentStep === 2 && (
          <form
            className="registration-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleNext();
            }}
          >
            <h2>Administrator Account</h2>
            <p>Create the account for the organization administrator.</p>

            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              value={adminDetails.fullName}
              onChange={handleAdminChange}
              placeholder="Enter full name"
              autoComplete="name"
              required
            />

            <label htmlFor="adminEmail">Email Address</label>
            <input
              type="email"
              id="adminEmail"
              name="email"
              value={adminDetails.email}
              onChange={handleAdminChange}
              placeholder="admin@company.com"
              autoComplete="email"
              required
            />

            <label htmlFor="adminPassword">Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                id="adminPassword"
                name="password"
                value={adminDetails.password}
                onChange={handleAdminChange}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={adminDetails.confirmPassword}
              onChange={handleAdminChange}
              placeholder="Re-enter password"
              autoComplete="new-password"
              minLength={8}
              required
            />

            {errorMessage && <p className="registration-error" role="alert">{errorMessage}</p>}
            <div className="registration-actions">
              <button type="button" className="secondary-action" onClick={handleBack}>
                Back
              </button>
              <button type="submit">Continue</button>
            </div>
          </form>
        )}

        {currentStep === 3 && !successMessage && (
          <form className="registration-form" onSubmit={handleSubmit}>
            <h2>Review & Register</h2>
            <p>Verify the organization details before submitting.</p>

            <div className="review-section">
              <h3>Company</h3>
              <dl>
                <div><dt>Name</dt><dd>{companyDetails.companyName}</dd></div>
                <div><dt>Email</dt><dd>{companyDetails.companyEmail}</dd></div>
                <div><dt>Domain</dt><dd>{companyDetails.companyDomain}</dd></div>
                <div><dt>Contact</dt><dd>{companyDetails.contactNumber}</dd></div>
                <div><dt>Size</dt><dd>{companyDetails.companySize}</dd></div>
                <div><dt>Address</dt><dd>{companyDetails.companyAddress}</dd></div>
              </dl>
            </div>

            <div className="review-section">
              <h3>Administrator</h3>
              <dl>
                <div><dt>Name</dt><dd>{adminDetails.fullName}</dd></div>
                <div><dt>Email</dt><dd>{adminDetails.email}</dd></div>
              </dl>
            </div>

            {errorMessage && <p className="registration-error" role="alert">{errorMessage}</p>}
            <div className="registration-actions">
              <button type="button" className="secondary-action" onClick={handleBack}>
                Back
              </button>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Create Organization"}
              </button>
            </div>
          </form>
        )}

        {successMessage && (
          <div className="registration-success" role="status">
            <div className="success-icon">✓</div>
            <h2>Registration Complete</h2>
            <p>{successMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizationRegistration;
