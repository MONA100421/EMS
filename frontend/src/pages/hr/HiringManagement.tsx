import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  useTheme,
  InputAdornment,
} from "@mui/material";
import {
  Send as SendIcon,
  ContentCopy as CopyIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import StatusChip from "../../components/common/StatusChip";
import FeedbackDialog from "../../components/common/FeedbackDialog";
import api from "../../lib/api";


interface TokenRecord {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  expiresAt: string;
  status: "active" | "used" | "expired";
  used: boolean;
  link?: string;
  registrationLink?: string;
}

interface OnboardingApplication {
  id: string;
  employee: {
    username: string;
    email: string;
    name?: string;
  };
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  version: number;
  feedback?: string;
  hrFeedback?: string;
}


const HiringManagement: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [newHireEmail, setNewHireEmail] = useState("");
  const [newHireName, setNewHireName] = useState("");
  const [tokenGenerated, setTokenGenerated] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [tokens, setTokens] = useState<TokenRecord[]>([]);
  const [applications, setApplications] = useState<OnboardingApplication[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Invite history
        const tokenRes = await api.get("/hr/invite/history");
        setTokens(tokenRes.data.history);

        // Onboarding list
        const onboardingRes = await api.get("/hr/onboarding");
        const grouped = onboardingRes.data.grouped;

        // Flatten grouped structure
        const allApps = [
          ...grouped.pending,
          ...grouped.approved,
          ...grouped.rejected,
        ];

        setApplications(allApps);
      } catch (err) {
        console.error("Failed loading HR data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    application: OnboardingApplication | null;
  }>({
    open: false,
    type: "approve",
    application: null,
  });

  const applicationTabs = ["pending", "approved", "rejected"];
  const filteredApplications = applications.filter(
    (app) => app.status === applicationTabs[tabValue],
  );

  const handleGenerateToken = async () => {
    try {
      const res = await api.post("/hr/invite", {
        email: newHireEmail,
        name: newHireName,
      });

      setGeneratedLink(res.data.registrationLink);
      setTokenGenerated(true);

      // refresh history
      const tokenRes = await api.get("/hr/invite/history");
      setTokens(tokenRes.data.history);
    } catch (err) {
      console.error("Invite failed:", err);
    }
  };


  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
  };

  const handleReset = () => {
    setNewHireEmail("");
    setNewHireName("");
    setTokenGenerated(false);
    setGeneratedLink("");
  };

  const handleApprove = (app: OnboardingApplication) => {
    setFeedbackDialog({ open: true, type: "approve", application: app });
  };

  const handleReject = (app: OnboardingApplication) => {
    setFeedbackDialog({ open: true, type: "reject", application: app });
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    if (!feedbackDialog.application) return;

    try {
      await api.post(`/hr/onboarding/${feedbackDialog.application.id}/review`, {
        decision: feedbackDialog.type === "approve" ? "approved" : "rejected",
        feedback,
      });

      // reload
      const res = await api.get("/hr/onboarding");
      const grouped = res.data.grouped;
      const allApps = [
        ...grouped.pending,
        ...grouped.approved,
        ...grouped.rejected,
      ];
      setApplications(allApps);

      setFeedbackDialog({ open: false, type: "approve", application: null });
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Hiring Management
      </Typography>

      {/* Generate Token Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.main,
              }}
            >
              <SendIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Generate Registration Token
            </Typography>
          </Box>

          {!tokenGenerated ? (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "flex-start",
              }}
            >
              <TextField
                label="Full Name"
                value={newHireName}
                onChange={(e) => setNewHireName(e.target.value)}
                sx={{ minWidth: 200, flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Email Address"
                type="email"
                value={newHireEmail}
                onChange={(e) => setNewHireEmail(e.target.value)}
                sx={{ minWidth: 250, flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleGenerateToken}
                disabled={!newHireEmail || !newHireName}
                sx={{ height: 56 }}
              >
                Generate & Send Token
              </Button>
            </Box>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Registration token generated successfully!
              </Alert>
              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.background.default,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <LinkIcon sx={{ color: theme.palette.primary.main }} />
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {generatedLink}
                </Typography>
                <Tooltip title="Copy link">
                  <IconButton onClick={handleCopyLink}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mb: 2 }}
              >
                Sent to: <strong>{newHireName}</strong> ({newHireEmail})
              </Typography>
              <Button variant="outlined" onClick={handleReset}>
                Generate Another
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Token History */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: `${theme.palette.secondary.main}15`,
                color: theme.palette.secondary.main,
              }}
            >
              <HistoryIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Token History
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Registration Link</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {token.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {token.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {token.registrationLink ?? "-"}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              token.registrationLink ?? "",
                            )
                          }
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(token.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(token.expiresAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={token.status} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Onboarding Applications */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Onboarding Applications
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab
                label={`Pending (${applications.filter((a) => a.status === "pending").length})`}
              />
              <Tab
                label={`Approved (${applications.filter((a) => a.status === "approved").length})`}
              />
              <Tab
                label={`Rejected (${applications.filter((a) => a.status === "rejected").length})`}
              />
            </Tabs>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  {tabValue === 2 && <TableCell>Feedback</TableCell>}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 36,
                            height: 36,
                          }}
                        >
                          {app.employee?.username
                            ? app.employee.username[0]
                            : "?"}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {app.employee?.username?.[0] ?? "?"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {app.employee?.email ?? "-"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{app.submittedAt}</TableCell>
                    <TableCell>
                      <StatusChip status={app.status} />
                    </TableCell>
                    {tabValue === 2 && (
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {app.feedback ?? app.hrFeedback ?? "-"}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Tooltip title="View Application">
                          <IconButton size="small">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {app.status === "pending" && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                sx={{ color: theme.palette.success.main }}
                                onClick={() => handleApprove(app)}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                sx={{ color: theme.palette.error.main }}
                                onClick={() => handleReject(app)}
                              >
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredApplications.length === 0 && (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary }}
              >
                No {applicationTabs[tabValue]} applications
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <FeedbackDialog
        open={feedbackDialog.open}
        type={feedbackDialog.type}
        title={
          feedbackDialog.type === "approve"
            ? "Approve Application"
            : "Reject Application"
        }
        itemName={
          feedbackDialog.application?.employee?.name ??
          feedbackDialog.application?.employee?.username
        }
        requireFeedback={feedbackDialog.type === "reject"}
        onSubmit={handleFeedbackSubmit}
        onCancel={() =>
          setFeedbackDialog({ open: false, type: "approve", application: null })
        }
      />
    </Box>
  );
};

export default HiringManagement;
