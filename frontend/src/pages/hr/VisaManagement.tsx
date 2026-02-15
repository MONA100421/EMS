import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  useTheme,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import StatusChip from "../../components/common/StatusChip";
import FeedbackDialog from "../../components/common/FeedbackDialog";
import api from "../../lib/api";

interface VisaRecord {
  id: string;
  employeeName: string;
  email: string;
  visaType: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  currentStep: string;
  stepStatus: "pending" | "approved" | "rejected";
  nextAction: string;
  documentKey?: string; // presign 用
}

const VisaManagement: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const [inProgressRecords, setInProgressRecords] = useState<VisaRecord[]>([]);
  const [allRecords, setAllRecords] = useState<VisaRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    record: VisaRecord | null;
  }>({
    open: false,
    type: "approve",
    record: null,
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get("/hr/visa-overview");
      setInProgressRecords(res.data.inProgress || []);
      setAllRecords(res.data.all || []);
    } catch (err) {
      console.error("Failed to fetch visa records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const records = tabValue === 0 ? inProgressRecords : allRecords;

  const handleApprove = (record: VisaRecord) => {
    setFeedbackDialog({ open: true, type: "approve", record });
  };

  const handleReject = (record: VisaRecord) => {
    setFeedbackDialog({ open: true, type: "reject", record });
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    if (!feedbackDialog.record) return;

    try {
      if (feedbackDialog.type === "approve") {
        await api.post(`/hr/documents/${feedbackDialog.record.id}/approve`);
      } else {
        await api.post(`/hr/documents/${feedbackDialog.record.id}/reject`, {
          feedback,
        });
      }

      await fetchRecords();
    } catch (err) {
      console.error("Failed to update document:", err);
    } finally {
      setFeedbackDialog({ open: false, type: "approve", record: null });
    }
  };

  const handleViewOrDownload = async (record: VisaRecord) => {
    if (!record.documentKey) return;

    try {
      const res = await api.post("/uploads/presign-get", {
        key: record.documentKey,
      });

      window.open(res.data.downloadUrl, "_blank");
    } catch (err) {
      console.error("Failed to get download url", err);
    }
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 30) return theme.palette.error.main;
    if (days <= 90) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Visa Status Management
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary }}
          >
            Review and manage employee visa documents and applications
          </Typography>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label={`In Progress (${inProgressRecords.length})`} />
            <Tab label={`All (${allRecords.length})`} />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Visa Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Days Remaining</TableCell>
                <TableCell>Current Step</TableCell>
                <TableCell>Next Action</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                records.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <Avatar>
                          {record.employeeName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {record.employeeName}
                          </Typography>
                          <Typography variant="caption">
                            {record.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip label={record.visaType} size="small" />
                    </TableCell>

                    <TableCell>{record.startDate}</TableCell>
                    <TableCell>{record.endDate}</TableCell>

                    <TableCell>
                      <Typography
                        fontWeight={600}
                        color={getDaysRemainingColor(record.daysRemaining)}
                      >
                        {record.daysRemaining} days
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Typography>{record.currentStep}</Typography>
                        <StatusChip status={record.stepStatus} size="small" />
                      </Box>
                    </TableCell>

                    <TableCell>{record.nextAction}</TableCell>

                    <TableCell align="right">
                      {record.stepStatus === "pending" && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => handleViewOrDownload(record)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              onClick={() => handleViewOrDownload(record)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(record)}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleReject(record)}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {record.currentStep === "I-983" && (
                            <Tooltip title="Send Notification">
                              <IconButton size="small" color="primary">
                                <SendIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <FeedbackDialog
        open={feedbackDialog.open}
        type={feedbackDialog.type}
        title={
          feedbackDialog.type === "approve"
            ? "Approve Document"
            : "Reject Document"
        }
        itemName={
          feedbackDialog.record
            ? `${feedbackDialog.record.employeeName} - ${feedbackDialog.record.currentStep}`
            : ""
        }
        requireFeedback={feedbackDialog.type === "reject"}
        onSubmit={handleFeedbackSubmit}
        onCancel={() =>
          setFeedbackDialog({ open: false, type: "approve", record: null })
        }
      />
    </Box>
  );
};

export default VisaManagement;
