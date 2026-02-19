import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  ContactEmergency as EmergencyIcon,
  Description as DocumentIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import api from "../../lib/api";

interface SectionData {
  [key: string]: string;
}

interface DocumentItem {
  name: string;
  type: string;
  uploadedAt: string;
  fileUrl?: string;
}

interface FormDataType {
  name: SectionData;
  address: SectionData;
  contact: SectionData;
  employment: SectionData;
  workAuthorization: SectionData;
  emergency: SectionData;
}

const PersonalInformation: React.FC = () => {
  const theme = useTheme();

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [tempData, setTempData] = useState<SectionData>({});
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const [formData, setFormData] = useState<FormDataType>({
    name: { firstName: "", lastName: "", middleName: "", preferredName: "" },
    address: {
      street: "",
      apt: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    contact: { email: "", phone: "", workPhone: "" },
    employment: {
      employeeId: "",
      title: "",
      department: "",
      manager: "",
    },

    workAuthorization: {
      startDate: "",
      authType: "",
    },
    emergency: {
      contactName: "",
      relationship: "",
      phone: "",
      email: "",
    },
  });


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/employee/me");
        const user = res.data.user || {};
        const profile = user.profile || {};
        const workAuth = user.workAuthorization || {};

        setFormData({
          name: {
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            middleName: profile.middleName || "",
            preferredName: profile.preferredName || "",
          },
          address: {
            street: profile.address?.street || "",
            apt: profile.address?.apt || "",
            city: profile.address?.city || "",
            state: profile.address?.state || "",
            zipCode: profile.address?.zip || "",
            country: profile.address?.country || "",
          },
          contact: {
            email: user.email || "",
            phone: profile.contact?.phone || "",
            workPhone: profile.contact?.workPhone || "",
          },
          employment: {
            employeeId: "",
            title: "",
            department: "",
            manager: "",
          },

          workAuthorization: {
            startDate: workAuth.startDate || "",
            authType: workAuth.authType || "",
          },
          emergency: {
            contactName: profile.emergency?.contactName || "",
            relationship: profile.emergency?.relationship || "",
            phone: profile.emergency?.phone || "",
            email: profile.emergency?.email || "",
          },
        });

        const docsRes = await api.get("/documents/me");
        setDocuments(docsRes.data.documents || []);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    setTempData({ ...formData[sectionId] });
  };

  const handleSave = async (sectionId: string) => {
    try {
      let payload: Record<string, unknown> = {};

      if (sectionId === "name") {
        payload = {
          firstName: tempData.firstName,
          lastName: tempData.lastName,
          middleName: tempData.middleName,
          preferredName: tempData.preferredName,
        };
      }

      if (sectionId === "address") {
        payload = {
          address: {
            street: tempData.street,
            apt: tempData.apt,
            city: tempData.city,
            state: tempData.state,
            zip: tempData.zipCode,
            country: tempData.country,
          },
        };
      }

      if (sectionId === "contact") {
        payload = {
          phone: tempData.phone,
          workPhone: tempData.workPhone,
          email: tempData.email,
        };
      }

      if (sectionId === "emergency") {
        payload = {
          emergency: tempData,
        };
      }

      if (sectionId === "workAuthorization") {
        payload = {
          workAuthorization: {
            startDate: tempData.startDate,
            authType: tempData.authType,
          },
        };
      }

      await api.patch("/employee/me", payload);

      setFormData((prev) => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          ...tempData,
        },
      }));

      setEditingSection(null);
      setTempData({});
    } catch (err) {
      console.error("Failed to save section:", err);
    }
  };

  const handleDownload = async (fileUrl?: string) => {
    if (!fileUrl) return;
    try {
      const res = await api.post("/uploads/presign-get", { fileUrl });
      window.open(res.data.downloadUrl, "_blank");
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const handleCancel = () => setCancelDialogOpen(true);

  const confirmCancel = () => {
    setEditingSection(null);
    setTempData({});
    setCancelDialogOpen(false);
  };

  const handleFieldChange = (field: string, value: string) => {
    setTempData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar sx={{ width: 100, height: 100 }}>
              {formData.name.firstName?.[0]}
              {formData.name.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {formData.name.firstName} {formData.name.lastName}
              </Typography>
              <Typography variant="body2">
                {formData.employment.title} • {formData.employment.department}
              </Typography>
              <Typography variant="body2">{formData.contact.email}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Name</Typography>

            {editingSection === "name" ? (
              <>
                <IconButton onClick={() => handleSave("name")}>
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={handleCancel}>
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => handleEdit("name")}>
                <EditIcon />
              </IconButton>
            )}
          </Box>

          {editingSection === "name" ? (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  value={tempData.firstName || ""}
                  onChange={(e) =>
                    handleFieldChange("firstName", e.target.value)
                  }
                />
              </Grid>
            </Grid>
          ) : (
            <Typography>
              {formData.name.firstName} {formData.name.lastName}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Documents
            </Typography>
            <Button startIcon={<UploadIcon />} variant="outlined">
              Upload New
            </Button>
          </Box>

          <Grid container spacing={2}>
            {documents.map((doc, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <DocumentIcon />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {doc.name}
                    </Typography>
                    <Typography variant="caption">
                      {doc.type} • {doc.uploadedAt}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(doc.fileUrl)}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}

            {documents.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" align="center">
                  No documents uploaded yet
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Discard Changes?"
        message="Unsaved changes will be lost."
        confirmText="Discard"
        confirmColor="error"
        onConfirm={confirmCancel}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </Box>
  );
};

export default PersonalInformation;
