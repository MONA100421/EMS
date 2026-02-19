import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

import api from "../../lib/api";
import FeedbackDialog from "../../components/common/FeedbackDialog";
import StatusChip from "../../components/common/StatusChip";

// TYPES

interface EmployeeInfo {
  id: string;
  fullName: string;
  email: string;
}

interface OnboardingApplication {
  id: string;
  status: "pending" | "approved" | "rejected";
  formData: Record<string, string>;
  hrFeedback?: string;
  employee: EmployeeInfo;
}

interface DocumentItem {
  _id: string;
  fileName: string;
  type: string;
  status: "pending" | "approved" | "rejected" | "not_started";
  uploadedAt?: string;
  hrFeedback?: string;
}

// COMPONENT

const OnboardingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<OnboardingApplication | null>(
    null,
  );
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
  }>({ open: false, type: "approve" });

  // LOAD DATA

  const loadData = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);

      const res = await api.get(`/hr/onboarding/${id}`);
      const app: OnboardingApplication = res.data.application;
      setApplication(app);

      const docsRes = await api.get(`/documents/by-user/${app.employee.id}`);
      setDocuments(docsRes.data.documents || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load onboarding detail");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // APPLICATION ACTIONS

  const handleApproveApplication = async () => {
    if (!application) return;

    try {
      await api.post(`/hr/onboarding/${application.id}/review`, {
        decision: "approved",
      });
      navigate("/hr/hiring");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Approve failed");
      }
    }
  };

  const handleRejectApplication = async (feedback: string) => {
    if (!application) return;

    try {
      await api.post(`/hr/onboarding/${application.id}/review`, {
        decision: "rejected",
        feedback,
      });
      navigate("/hr/hiring");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Reject failed");
      }
    }
  };

  // DOCUMENT ACTIONS

  const handleApproveDocument = async (docId: string) => {
    await api.post(`/hr/documents/${docId}/approve`);
    loadData();
  };

  const handleRejectDocument = async (docId: string, feedback: string) => {
    await api.post(`/hr/documents/${docId}/reject`, { feedback });
    loadData();
  };

  const handlePreview = async (docId: string) => {
    const res = await api.get(`/documents/${docId}/download`);
    if (res.data.ok) {
      window.open(res.data.downloadUrl, "_blank");
    }
  };

  // RENDER

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  if (!application)
    return <Alert severity="error">Application not found</Alert>;

  const canReview = application.status === "pending";

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Onboarding Application Review
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {application.employee.fullName} · {application.employee.email}
          </Typography>
        </Box>
        <StatusChip status={application.status} />
      </Stack>

      {application.status === "rejected" && application.hrFeedback && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Previous Feedback:</strong>
          <br />
          {application.hrFeedback}
        </Alert>
      )}

      {/* FORM DATA */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Submitted Information
          </Typography>

          <Grid container spacing={2}>
            {Object.entries(application.formData).map(([key, value]) => (
              <Grid item xs={6} key={key}>
                <Typography variant="body2">
                  <strong>{key}:</strong> {value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* DOCUMENTS */}
      <Typography variant="h6" mb={2}>
        Uploaded Documents
      </Typography>

      <Stack spacing={2}>
        {documents.map((doc) => (
          <Card key={doc._id}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography fontWeight={600}>{doc.fileName}</Typography>
                  <Typography variant="caption">
                    {doc.type} · {doc.status}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => handlePreview(doc._id)}
                  >
                    Preview
                  </Button>

                  {canReview && doc.status === "pending" && (
                    <>
                      <Button
                        size="small"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() => handleApproveDocument(doc._id)}
                      >
                        Approve
                      </Button>

                      <Button
                        size="small"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() =>
                          setFeedbackDialog({ open: true, type: "reject" })
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Divider sx={{ my: 4 }} />

      {/* APPLICATION ACTIONS */}
      {canReview ? (
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            onClick={() => setFeedbackDialog({ open: true, type: "approve" })}
          >
            Approve Application
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={() => setFeedbackDialog({ open: true, type: "reject" })}
          >
            Reject Application
          </Button>

          <Button onClick={() => navigate("/hr/hiring")}>Back</Button>
        </Stack>
      ) : (
        <Alert severity="info">
          This application has already been {application.status}.
        </Alert>
      )}

      <FeedbackDialog
        open={feedbackDialog.open}
        type={feedbackDialog.type}
        title={
          feedbackDialog.type === "approve"
            ? "Approve Application"
            : "Reject Application"
        }
        itemName={application.employee.fullName}
        requireFeedback={feedbackDialog.type === "reject"}
        onCancel={() => setFeedbackDialog({ open: false, type: "approve" })}
        onSubmit={(feedback) => {
          if (feedbackDialog.type === "approve") handleApproveApplication();
          else handleRejectApplication(feedback);
        }}
      />
    </Box>
  );
};

export default OnboardingDetail;
