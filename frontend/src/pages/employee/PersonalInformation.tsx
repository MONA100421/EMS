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

const PersonalInformation: React.FC = () => {
  const theme = useTheme();

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [tempData, setTempData] = useState<SectionData>({});
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const [formData, setFormData] = useState<Record<string, SectionData>>({
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
      startDate: "",
      workAuthorization: "",
    },
    emergency: { contactName: "", relationship: "", phone: "", email: "" },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/employee/me");
        const emp = res.data.employee || {};

        setFormData({
          name: {
            firstName: emp.firstName || "",
            lastName: emp.lastName || "",
            middleName: emp.middleName || "",
            preferredName: emp.preferredName || "",
          },
          address: {
            street: emp.address?.street || "",
            apt: emp.address?.apt || "",
            city: emp.address?.city || "",
            state: emp.address?.state || "",
            zipCode: emp.address?.zipCode || "",
            country: emp.address?.country || "",
          },
          contact: {
            email: emp.email || "",
            phone: emp.phone || "",
            workPhone: emp.workPhone || "",
          },
          employment: {
            employeeId: emp.employeeId || "",
            title: emp.title || "",
            department: emp.department || "",
            manager: emp.manager || "",
            startDate: emp.startDate || "",
            workAuthorization: emp.workAuthorization || "",
          },
          emergency: {
            contactName: emp.emergency?.contactName || "",
            relationship: emp.emergency?.relationship || "",
            phone: emp.emergency?.phone || "",
            email: emp.emergency?.email || "",
          },
        });

        const docsRes = await api.get("/documents/my");
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

      if (sectionId === "name") payload = tempData;
      if (sectionId === "address") payload = { address: tempData };
      if (sectionId === "contact")
        payload = {
          phone: tempData.phone,
          workPhone: tempData.workPhone,
          email: tempData.email,
        };
      if (sectionId === "emergency") payload = { emergency: tempData };

      await api.patch("/employee/me", payload);

      setFormData((prev) => ({
        ...prev,
        [sectionId]: { ...tempData },
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
