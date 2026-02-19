import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Alert,
  Chip,
  useTheme,
  Paper,
  IconButton,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Description as DocIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import type { StatusType } from "../../components/common/StatusChip";
import FileUpload from "../../components/common/FileUpload";
import StatusChip from "../../components/common/StatusChip";
import api from "../../lib/api";


type StepStatus = "not-started" | "pending" | "approved" | "rejected";

interface VisaStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  document?: string;
  feedback?: string;
  uploadedAt?: string;
  fileUrl?: string;
}

type RawDoc = {
  type: string;
  fileName?: string;
  status?: "not-started" | "pending" | "approved" | "rejected";
  feedback?: string;
  uploadedAt?: string;
  fileUrl?: string;
};

const transformDocs = (docs: RawDoc[]): VisaStep[] => {
  const base: VisaStep[] = [
    {
      id: "opt_receipt",
      title: "OPT Receipt",
      description: "Upload your OPT Receipt Notice (I-797C)",
      status: "not-started",
    },
    {
      id: "opt_ead",
      title: "EAD Card",
      description: "Upload your Employment Authorization Document",
      status: "not-started",
    },
    {
      id: "i_983",
      title: "I-983 Form",
      description:
        "Download, complete, and upload the I-983 Training Plan form",
      status: "not-started",
    },
    {
      id: "i_20",
      title: "I-20",
      description: "Upload your updated I-20 with STEM extension",
      status: "not-started",
    },
  ];

  return base.map((step) => {
    const found = docs.find((d) => d.type === step.id);
    return {
      ...step,
      status: (found?.status as StepStatus) || step.status,
      document: found?.fileName,
      feedback: found?.feedback,
      uploadedAt: found?.uploadedAt,
      fileUrl: found?.fileUrl,
    };
  });
};

const VisaStatus: React.FC = () => {
  const [authType, setAuthType] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const theme = useTheme();

  const [steps, setSteps] = useState<VisaStep[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/users/me");
        const type = userRes.data.user?.workAuthorization?.authType || null;

        setAuthType(type);

        if (!["opt", "opt-stem"].includes(type)) {
          setLoadingAuth(false);
          return;
        }

        const res = await api.get("/documents/me");
        const docs = res.data.documents;
        setSteps(transformDocs(docs));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAuth(false);
      }
    };

    fetchData();
  }, []);


  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case "approved":
        return <CheckIcon sx={{ color: theme.palette.success.main }} />;
      case "pending":
        return <PendingIcon sx={{ color: theme.palette.warning.main }} />;
      case "rejected":
        return <RejectedIcon sx={{ color: theme.palette.error.main }} />;
      default:
        return <DocIcon sx={{ color: theme.palette.grey[400] }} />;
    }
  };

  const getActiveStep = (): number => {
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].status !== "approved") {
        return i;
      }
    }
    return steps.length;
  };

  const isStepDisabled = (index: number): boolean => {
    if (index === 0) return false;
    return steps[index - 1].status !== "approved";
  };

  const handleFileUpload = async (stepId: string, file: File) => {
    try {
      const presign = await api.post("/uploads/presign", {
        fileName: file.name,
        contentType: file.type,
        type: stepId,
        category: "visa",
      });

      await fetch(presign.data.uploadUrl, {
        method: "PUT",
        body: file,
      });

      await api.post("/uploads/complete", {
        fileUrl: presign.data.fileUrl,
        fileName: file.name,
        type: stepId,
        category: "visa",
      });

      const res = await api.get("/documents/me");
      setSteps(transformDocs(res.data.documents));
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };


  const activeStep = getActiveStep();
  const completedSteps = steps.filter((s) => s.status === "approved").length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  if (loadingAuth) {
    return null;
  }

  if (!["opt", "opt-stem"].includes(authType || "")) {
    return (
      <Alert severity="info" sx={{ mt: 4 }}>
        Visa management is only required for OPT or STEM Extension employees.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Visa Status Management
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                Track and manage your OPT/STEM Extension documents
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {authType === "opt" && (
                <Chip
                  label="OPT"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}

              {authType === "opt-stem" && (
                <>
                  <Chip
                    label="OPT"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    label="STEM Extension"
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </>
              )}
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Overall Progress
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: theme.palette.primary.main }}
              >
                {completedSteps} of {steps.length} steps completed
              </Typography>
            </Box>
            <Box
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: theme.palette.grey[200],
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${progress}%`,
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          Complete each step in order. You cannot proceed to the next step until
          the current one is approved by HR. Make sure all documents are clear
          and legible.
        </Typography>
      </Alert>

      {/* Stepper */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.id} completed={step.status === "approved"}>
                <StepLabel
                  icon={getStepIcon(step.status)}
                  optional={
                    <StatusChip
                      status={
                        step.status === "not-started"
                          ? "not-started"
                          : (step.status as StatusType)
                      }
                      size="small"
                    />
                  }
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ py: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary, mb: 3 }}
                    >
                      {step.description}
                    </Typography>

                    {step.status === "rejected" && step.feedback && (
                      <Alert severity="error" sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Feedback: {step.feedback}
                        </Typography>
                      </Alert>
                    )}

                    {step.status === "pending" && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Waiting for HR to approve your {step.title}
                      </Alert>
                    )}

                    {step.status === "approved" &&
                      step.id === "opt_receipt" && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Please upload a copy of your OPT EAD
                        </Alert>
                      )}

                    {step.status === "approved" && step.id === "opt_ead" && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Please download and fill out the I-983 form
                      </Alert>
                    )}

                    {step.status === "approved" && step.id === "i_983" && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        Please send the I-983 to your school and upload the new
                        I-20
                      </Alert>
                    )}

                    {step.status === "approved" && step.id === "i_20" && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        All documents have been approved
                      </Alert>
                    )}

                    {step.document && step.status !== "rejected" ? (
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          bgcolor: theme.palette.background.default,
                          mb: 2,
                        }}
                      >
                        <DocIcon sx={{ color: theme.palette.primary.main }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {step.document}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            Uploaded on {step.uploadedAt}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {/* Preview */}
                          <IconButton
                            size="small"
                            component="a"
                            href={step.fileUrl}
                            target="_blank"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>

                          {/* Download */}
                          <IconButton
                            size="small"
                            component="a"
                            href={step.fileUrl}
                            download
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    ) : (
                      !isStepDisabled(index) && (
                        <FileUpload
                          label={`Upload ${step.title}`}
                          onFileSelect={(file) =>
                            handleFileUpload(step.id, file)
                          }
                          disabled={isStepDisabled(index)}
                        />
                      )
                    )}

                    {step.id === "opt_receipt" &&
                      step.status !== "rejected" && (
                        <Alert severity="info">
                          OPT Receipt is submitted during onboarding.
                        </Alert>
                      )}

                    {step.id === "i_983" && !isStepDisabled(index) && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          sx={{ mr: 2 }}
                        >
                          Download Empty I-983 Template
                        </Button>
                        <Button variant="outlined" startIcon={<DownloadIcon />}>
                          Download Sample I-983
                        </Button>
                      </Box>
                    )}

                    {isStepDisabled(index) && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Complete the previous step before proceeding.
                      </Alert>
                    )}
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <CheckIcon
                sx={{ fontSize: 64, color: theme.palette.success.main, mb: 2 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                All Steps Completed!
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary }}
              >
                Congratulations! Your STEM OPT extension process is complete.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default VisaStatus;
