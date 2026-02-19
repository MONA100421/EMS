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
  LinearProgress,
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
import imageCompression from "browser-image-compression";
import axios from "axios";

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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [uploadProgress, setUploadProgress] = useState(0);

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
      endDate: "",
      authType: "",
      title: "",
    },

    emergency: {
      firstName: "",
      lastName: "",
      middleName: "",
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
        setPhotoUrl(profile.photoUrl);
        

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
            endDate: workAuth.endDate || "",
            authType: workAuth.authType || "",
            title: workAuth.title || "",
          },

          emergency: {
            firstName: profile.emergency?.firstName || "",
            lastName: profile.emergency?.lastName || "",
            middleName: profile.emergency?.middleName || "",
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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


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

      if (sectionId === "employment") {
        payload = {
          workAuthorization: {
            title: tempData.title,
            startDate: formData.workAuthorization.startDate,
            endDate: formData.workAuthorization.endDate,
            authType: formData.workAuthorization.authType,
          },
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
          emergency: {
            firstName: tempData.firstName,
            lastName: tempData.lastName,
            middleName: tempData.middleName,
            phone: tempData.phone,
            email: tempData.email,
            relationship: tempData.relationship,
          },
        };
      }

      if (sectionId === "workAuthorization") {
        payload = {
          workAuthorization: {
            startDate: tempData.startDate,
            endDate: tempData.endDate,
            authType: tempData.authType,
            title: tempData.title,
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

  const handleProfilePhotoUpload = async (file: File) => {
    try {
      setUploadingPhoto(true);

      if (previewUrl) URL.revokeObjectURL(previewUrl);

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      const presign = await api.post("/uploads/presign", {
        fileName: compressedFile.name,
        contentType: compressedFile.type,
        type: "profile_photo",
        category: "onboarding",
      });

      await axios.put(presign.data.uploadUrl, compressedFile, {
        headers: {
          "Content-Type": compressedFile.type,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(percent);
        },
      });

      await api.post("/uploads/complete", {
        fileUrl: presign.data.fileUrl,
        fileName: compressedFile.name,
        type: "profile_photo",
        category: "onboarding",
      });

      await api.patch("/employee/me", {
        photoUrl: presign.data.fileUrl,
      });

      setPhotoUrl(presign.data.fileUrl);
      setPreviewUrl(undefined);
    } catch (err) {
      console.error("Profile photo upload failed:", err);
    } finally {
      setUploadingPhoto(false);
      setUploadProgress(0);
    }
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                src={previewUrl || photoUrl}
                sx={{ width: 100, height: 100 }}
              >
                {formData.name.firstName?.[0]}
                {formData.name.lastName?.[0]}
              </Avatar>

              {uploadingPhoto && (
                <Box sx={{ width: 100, mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                  />
                  <Typography variant="caption">{uploadProgress}%</Typography>
                </Box>
              )}

              <Button
                component="label"
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? "Uploading..." : "Change Photo"}
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files &&
                    handleProfilePhotoUpload(e.target.files[0])
                  }
                />
              </Button>
            </Box>

            {/* User Info */}
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

      {/* Address */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Address</Typography>

            {editingSection === "address" ? (
              <>
                <IconButton onClick={() => handleSave("address")}>
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={handleCancel}>
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => handleEdit("address")}>
                <EditIcon />
              </IconButton>
            )}
          </Box>

          {editingSection === "address" ? (
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street"
                  value={tempData.street || ""}
                  onChange={(e) => handleFieldChange("street", e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={tempData.city || ""}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={tempData.state || ""}
                  onChange={(e) => handleFieldChange("state", e.target.value)}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="ZIP"
                  value={tempData.zipCode || ""}
                  onChange={(e) => handleFieldChange("zipCode", e.target.value)}
                />
              </Grid>
            </Grid>
          ) : (
            <Typography mt={1}>
              {formData.address.street}, {formData.address.city},{" "}
              {formData.address.state} {formData.address.zipCode}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Contact Info</Typography>

            {editingSection === "contact" ? (
              <>
                <IconButton onClick={() => handleSave("contact")}>
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={handleCancel}>
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => handleEdit("contact")}>
                <EditIcon />
              </IconButton>
            )}
          </Box>

          {editingSection === "contact" ? (
            <Grid container spacing={2} mt={1}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Cell Phone"
                  value={tempData.phone || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Work Phone"
                  value={tempData.workPhone || ""}
                  onChange={(e) =>
                    handleFieldChange("workPhone", e.target.value)
                  }
                />
              </Grid>
            </Grid>
          ) : (
            <Typography mt={1}>
              {formData.contact.phone} / {formData.contact.workPhone}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Employment */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Employment</Typography>

            {editingSection === "employment" ? (
              <>
                <IconButton onClick={() => handleSave("employment")}>
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={handleCancel}>
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => handleEdit("employment")}>
                <EditIcon />
              </IconButton>
            )}
          </Box>

          {editingSection === "employment" ? (
            <Grid container spacing={2} mt={1}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Title"
                  value={tempData.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Department"
                  value={tempData.department || ""}
                  onChange={(e) =>
                    handleFieldChange("department", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={tempData.startDate || ""}
                  onChange={(e) =>
                    handleFieldChange("startDate", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={tempData.endDate || ""}
                  onChange={(e) => handleFieldChange("endDate", e.target.value)}
                />
              </Grid>
            </Grid>
          ) : (
            <Typography mt={1}>
              {formData.employment.title} • {formData.employment.department}
              <br />
              {formData.employment.startDate} – {formData.employment.endDate}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Work Authorization */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Work Authorization</Typography>

            {editingSection === "workAuthorization" ? (
              <>
                <IconButton onClick={() => handleSave("workAuthorization")}>
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={handleCancel}>
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => handleEdit("workAuthorization")}>
                <EditIcon />
              </IconButton>
            )}
          </Box>

          {editingSection === "workAuthorization" ? (
            <Grid container spacing={2} mt={1}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Authorization Type"
                  value={tempData.authType || ""}
                  onChange={(e) =>
                    handleFieldChange("authType", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Visa Title"
                  value={tempData.title || ""}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={tempData.startDate || ""}
                  onChange={(e) =>
                    handleFieldChange("startDate", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={tempData.endDate || ""}
                  onChange={(e) => handleFieldChange("endDate", e.target.value)}
                />
              </Grid>
            </Grid>
          ) : (
            <Typography mt={1}>
              {formData.workAuthorization.authType} –{" "}
              {formData.workAuthorization.title}
              <br />
              {formData.workAuthorization.startDate} –{" "}
              {formData.workAuthorization.endDate}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Emergency */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Emergency Contact</Typography>

            {editingSection === "emergency" ? (
              <>
                <IconButton onClick={() => handleSave("emergency")}>
                  <SaveIcon />
                </IconButton>
                <IconButton onClick={handleCancel}>
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => handleEdit("emergency")}>
                <EditIcon />
              </IconButton>
            )}
          </Box>

          {editingSection === "emergency" ? (
            <Grid container spacing={2} mt={1}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={tempData.firstName || ""}
                  onChange={(e) =>
                    handleFieldChange("firstName", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={tempData.lastName || ""}
                  onChange={(e) =>
                    handleFieldChange("lastName", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Middle Name"
                  value={tempData.middleName || ""}
                  onChange={(e) =>
                    handleFieldChange("middleName", e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={tempData.phone || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={tempData.email || ""}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Relationship"
                  value={tempData.relationship || ""}
                  onChange={(e) =>
                    handleFieldChange("relationship", e.target.value)
                  }
                />
              </Grid>
            </Grid>
          ) : (
            <Typography mt={1}>
              {formData.emergency.firstName} {formData.emergency.lastName} —{" "}
              {formData.emergency.phone}
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
