import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  useTheme,
} from "@mui/material";
import {
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import StatusChip, { StatusType } from "../../components/common/StatusChip";
import FileUpload from "../../components/common/FileUpload";

type OnboardingStatus = "never-submitted" | "pending" | "approved" | "rejected";

const OnboardingApplication: React.FC = () => {
  const theme = useTheme();
  const [status, setStatus] = useState<OnboardingStatus>("never-submitted");
  const [activeStep, setActiveStep] = useState(0);
  const [rejectionFeedback] = useState(
    "Please upload a clearer copy of your driver license and SSN card.",
  );

  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    middleName: "",
    preferredName: "",
    ssn: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    emergencyContact: "",
    emergencyPhone: "",
    emergencyRelationship: "",
    workAuthType: "",
    workAuthOther: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    "Personal Info",
    "Address",
    "Work Authorization",
    "Documents",
    "Review",
  ];

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.ssn) newErrors.ssn = "SSN is required";
      if (!formData.dateOfBirth)
        newErrors.dateOfBirth = "Date of birth is required";
    } else if (step === 1) {
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.zipCode) newErrors.zipCode = "ZIP code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    setStatus("pending");
  };

  const getStatusBanner = () => {
    switch (status) {
      case "pending":
        return (
          <Alert severity="info" icon={<PendingIcon />} sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Application Pending Review
            </Typography>
            <Typography variant="body2">
              Your onboarding application has been submitted and is currently
              under review by HR. You will be notified once it's processed.
            </Typography>
          </Alert>
        );
      case "approved":
        return (
          <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Application Approved
            </Typography>
            <Typography variant="body2">
              Congratulations! Your onboarding application has been approved.
              Please proceed to complete your visa status information.
            </Typography>
          </Alert>
        );
      case "rejected":
        return (
          <Alert severity="error" icon={<RejectedIcon />} sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Application Rejected
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Unfortunately, your application needs revisions before it can be
              approved.
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Feedback: {rejectionFeedback}
            </Typography>
          </Alert>
        );
      default:
        return null;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={formData.firstName}
                onChange={handleChange("firstName")}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                required
                value={formData.lastName}
                onChange={handleChange("lastName")}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Middle Name"
                value={formData.middleName}
                onChange={handleChange("middleName")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Name"
                value={formData.preferredName}
                onChange={handleChange("preferredName")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Social Security Number"
                required
                value={formData.ssn}
                onChange={handleChange("ssn")}
                error={!!errors.ssn}
                helperText={errors.ssn}
                placeholder="XXX-XX-XXXX"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={handleChange("dateOfBirth")}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Gender"
                select
                SelectProps={{ native: true }}
                value={formData.gender}
                onChange={handleChange("gender")}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not">Prefer not to say</option>
              </TextField>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                required
                value={formData.address}
                onChange={handleChange("address")}
                error={!!errors.address}
                helperText={errors.address}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                required
                value={formData.city}
                onChange={handleChange("city")}
                error={!!errors.city}
                helperText={errors.city}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                required
                value={formData.state}
                onChange={handleChange("state")}
                error={!!errors.state}
                helperText={errors.state}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                required
                value={formData.zipCode}
                onChange={handleChange("zipCode")}
                error={!!errors.zipCode}
                helperText={errors.zipCode}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Emergency Contact
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Name"
                value={formData.emergencyContact}
                onChange={handleChange("emergencyContact")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.emergencyPhone}
                onChange={handleChange("emergencyPhone")}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Relationship"
                value={formData.emergencyRelationship}
                onChange={handleChange("emergencyRelationship")}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Work Authorization Type"
                select
                SelectProps={{ native: true }}
                value={formData.workAuthType}
                onChange={handleChange("workAuthType")}
              >
                <option value="">Select...</option>
                <option value="citizen">U.S. Citizen</option>
                <option value="green-card">Green Card</option>
                <option value="opt">OPT</option>
                <option value="opt-stem">OPT STEM Extension</option>
                <option value="h1b">H1-B</option>
                <option value="l2">L2</option>
                <option value="h4">H4</option>
                <option value="other">Other</option>
              </TextField>
            </Grid>
            {formData.workAuthType === "other" && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Please Specify"
                  value={formData.workAuthOther}
                  onChange={handleChange("workAuthOther")}
                />
              </Grid>
            )}
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FileUpload
                label="Driver's License / State ID *"
                onFileSelect={(file) => console.log("File selected:", file)}
                helperText="Upload a clear copy of your ID"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FileUpload
                label="Work Authorization Document *"
                onFileSelect={(file) => console.log("File selected:", file)}
                helperText="OPT EAD, Green Card, etc."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FileUpload
                label="Profile Photo"
                accept=".jpg,.jpeg,.png"
                onFileSelect={(file) => console.log("File selected:", file)}
                helperText="Professional headshot (optional)"
              />
            </Grid>
          </Grid>
        );
      case 4:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review your information before submitting. You can go back
              to any step to make changes.
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: theme.palette.text.secondary, mb: 1 }}
                    >
                      Personal Information
                    </Typography>
                    <Typography variant="body2">
                      <strong>Name:</strong> {formData.firstName}{" "}
                      {formData.middleName} {formData.lastName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>DOB:</strong>{" "}
                      {formData.dateOfBirth || "Not provided"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>SSN:</strong> ***-**-
                      {formData.ssn?.slice(-4) || "****"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: theme.palette.text.secondary, mb: 1 }}
                    >
                      Address
                    </Typography>
                    <Typography variant="body2">
                      {formData.address || "Not provided"}
                    </Typography>
                    <Typography variant="body2">
                      {formData.city}, {formData.state} {formData.zipCode}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  if (status === "pending" || status === "approved") {
    return (
      <Box>
        {getStatusBanner()}
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            {status === "pending" ? (
              <PendingIcon
                sx={{ fontSize: 64, color: theme.palette.info.main, mb: 2 }}
              />
            ) : (
              <CheckIcon
                sx={{ fontSize: 64, color: theme.palette.success.main, mb: 2 }}
              />
            )}
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {status === "pending"
                ? "Application Under Review"
                : "Onboarding Complete"}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.secondary }}
            >
              {status === "pending"
                ? "HR is reviewing your application. This typically takes 1-2 business days."
                : "Your onboarding application has been approved. Welcome to the team!"}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      {getStatusBanner()}

      <Card>
        <CardContent>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Onboarding Application
              </Typography>
              {status !== "never-submitted" && (
                <StatusChip status={status as StatusType} />
              )}
            </Box>

            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ minHeight: 300, mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={<SendIcon />}
                >
                  Submit Application
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OnboardingApplication;
