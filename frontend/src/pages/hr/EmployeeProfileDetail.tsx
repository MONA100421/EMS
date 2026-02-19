import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  IconButton,
  Paper,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  ContactEmergency as EmergencyIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import api from "../../lib/api";

interface Address {
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface Employment {
  employeeId?: string;
  title?: string;
  department?: string;
  manager?: string;
  startDate?: string;
  workAuthorization?: string;
}

interface Emergency {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
}

interface Employee {
  firstName: string;
  lastName: string;
  preferredName?: string;
  email: string;
  phone?: string;
  workPhone?: string;
  dateOfBirth?: string;
  ssn?: string;
  address?: Address;
  employment?: Employment;
  emergency?: Emergency;
}


interface DocumentItem {
  _id: string;
  fileName: string;
  type: string;
  uploadedAt: string;
}

const EmployeeProfileDetail: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/hr/employees/${id}`);
        setEmployee(res.data.employee);

        const docsRes = await api.get(`/documents/by-user/${id}`);
        setDocuments(docsRes.data.documents || []);
      } catch (err) {
        console.error("Failed to load employee profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEmployee();
  }, [id]);

  const handlePreview = async (docId: string) => {
    try {
      const res = await api.get(`/documents/${docId}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      window.open(url, "_blank");
    } catch (err) {
      console.error("Preview failed", err);
    }
  };

  const handleDownload = async (doc: DocumentItem) => {
    try {
      const res = await api.get(`/documents/${doc._id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName;
      a.click();
    } catch (err) {
      console.error("Download failed", err);
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography>Employee not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate("/hr/employees")}
        sx={{ mb: 2 }}
      >
        Back to Employees
      </Button>

      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: theme.palette.primary.main,
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              {employee.firstName?.[0]}
              {employee.lastName?.[0]}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight={700}>
                {employee.firstName} {employee.lastName}
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                {employee.employment?.title} • {employee.employment?.department}
              </Typography>

              <Typography variant="body2">{employee.email}</Typography>
            </Box>

            <Chip
              label={employee.employment?.workAuthorization || "N/A"}
              variant="outlined"
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Sections */}
      <Grid container spacing={3}>
        {/* Personal Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Personal Information
              </Typography>
              <Typography>
                <strong>DOB:</strong> {employee.dateOfBirth || "-"}
              </Typography>
              <Typography>
                <strong>SSN:</strong> {employee.ssn || "-"}
              </Typography>
              <Typography>
                <strong>Preferred Name:</strong> {employee.preferredName || "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Address */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Address
              </Typography>
              <Typography>{employee.address?.street || "-"}</Typography>
              <Typography>
                {employee.address?.city}, {employee.address?.state}{" "}
                {employee.address?.zipCode}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Documents */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Documents
              </Typography>

              <Grid container spacing={2}>
                {documents.map((doc) => (
                  <Grid item xs={12} sm={6} md={4} key={doc._id}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <DocumentIcon />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {doc.fileName}
                        </Typography>
                        <Typography variant="caption">
                          {doc.type} •{" "}
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={() => handlePreview(doc._id)}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleDownload(doc)}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  </Grid>
                ))}

                {documents.length === 0 && (
                  <Grid item xs={12}>
                    <Typography align="center">
                      No documents uploaded
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeProfileDetail;
