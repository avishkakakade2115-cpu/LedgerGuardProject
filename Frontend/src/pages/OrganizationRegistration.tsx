
import { useState } from "react";
import "../styles/registration.css";

function OrganizationRegistration() {
  const [currentStep, setCurrentStep] = useState(1);

  const [companyDetails, setCompanyDetails] = useState({
    companyName: "",
    companyEmail: "",
    companyDomain: "",
    contactNumber: "",
    companySize: "",
    companyAddress: "",
  });

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
          <div className="registration-form">
            <h2>Company Details</h2>
            <p>Enter your organization's information.</p>

            <label>Company Name</label>
            <input
              name="companyName"
              value={companyDetails.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
            />

            <label>Official Company Email</label>
            <input
              type="email"
              name="companyEmail"
              value={companyDetails.companyEmail}
              onChange={handleChange}
              placeholder="admin@company.com"
            />

            <label>Company Domain</label>
            <input
              name="companyDomain"
              value={companyDetails.companyDomain}
              onChange={handleChange}
              placeholder="company.com"
            />

            <label>Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={companyDetails.contactNumber}
              onChange={handleChange}
              placeholder="Enter contact number"
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
            />

            <button onClick={handleNext}>
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrganizationRegistration;
