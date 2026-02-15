import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Divider,
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
import { useAuth } from "../../contexts/AuthContext";

interface SectionData {
  [key: string]: string;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  fields: { name: string; label: string; type?: string; disabled?: boolean }[];
}

const PersonalInformation: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [tempData, setTempData] = useState<SectionData>({});

  const [formData, setFormData] = useState<Record<string, SectionData>>({
    name: {
      firstName: user?.firstName || "John",
      lastName: user?.lastName || "Doe",
      middleName: "",
      preferredName: "Johnny",
    },
    address: {
      street: "123 Main Street",
      apt: "Apt 4B",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    contact: {
      email: user?.email || "john.doe@company.com",
      phone: "+1 (555) 123-4567",
      workPhone: "+1 (555) 987-6543",
    },
    employment: {
      employeeId: "EMP-2024-001",
      title: "Software Engineer",
      department: "Engineering",
      manager: "Sarah Johnson",
      startDate: "2024-01-15",
      workAuthorization: "OPT",
    },
    emergency: {
      contactName: "Jane Doe",
      relationship: "Spouse",
      phone: "+1 (555) 111-2222",
      email: "jane.doe@email.com",
    },
  });

  const sections: Section[] = [
    {
      id: "name",
      title: "Name Information",
      icon: <PersonIcon />,
      fields: [
        { name: "firstName", label: "First Name" },
        { name: "lastName", label: "Last Name" },
        { name: "middleName", label: "Middle Name" },
        { name: "preferredName", label: "Preferred Name" },
      ],
    },
    {
      id: "address",
      title: "Address",
      icon: <HomeIcon />,
      fields: [
        { name: "street", label: "Street Address" },
        { name: "apt", label: "Apt/Suite" },
        { name: "city", label: "City" },
        { name: "state", label: "State" },
        { name: "zipCode", label: "ZIP Code" },
        { name: "country", label: "Country" },
      ],
    },
    {
      id: "contact",
      title: "Contact Information",
      icon: <PhoneIcon />,
      fields: [
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Personal Phone" },
        { name: "workPhone", label: "Work Phone" },
      ],
    },
    {
      id: "employment",
      title: "Employment",
      icon: <WorkIcon />,
      fields: [
        { name: "employeeId", label: "Employee ID", disabled: true },
        { name: "title", label: "Job Title", disabled: true },
        { name: "department", label: "Department", disabled: true },
        { name: "manager", label: "Manager", disabled: true },
        {
          name: "startDate",
          label: "Start Date",
          type: "date",
          disabled: true,
        },
        {
          name: "workAuthorization",
          label: "Work Authorization",
          disabled: true,
        },
      ],
    },
    {
      id: "emergency",
      title: "Emergency Contact",
      icon: <EmergencyIcon />,
      fields: [
        { name: "contactName", label: "Contact Name" },
        { name: "relationship", label: "Relationship" },
        { name: "phone", label: "Phone" },
        { name: "email", label: "Email", type: "email" },
      ],
    },
  ];

  const documents = [
    { name: "Driver License.pdf", type: "ID", uploadedAt: "2024-01-15" },
    { name: "SSN Card.pdf", type: "SSN", uploadedAt: "2024-01-15" },
    {
      name: "Work Authorization.pdf",
      type: "Work Auth",
      uploadedAt: "2024-01-16",
    },
  ];

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    setTempData({ ...formData[sectionId] });
  };

  const handleSave = (sectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      [sectionId]: { ...tempData },
    }));
    setEditingSection(null);
    setTempData({});
  };

  const handleCancel = () => {
    setCancelDialogOpen(true);
  };

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
      {/* Profile Header */}
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
              {formData.name.firstName?.[0]}
              {formData.name.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {formData.name.firstName} {formData.name.lastName}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary, mb: 1 }}
              >
                {formData.employment.title} • {formData.employment.department}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                {formData.contact.email}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Sections */}
      <Grid container spacing={3}>
        {sections.map((section) => (
          <Grid item xs={12} md={6} key={section.id}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                      {section.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {section.title}
                    </Typography>
                  </Box>
                  {editingSection === section.id ? (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleSave(section.id)}
                        sx={{ color: theme.palette.success.main }}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={handleCancel}
                        sx={{ color: theme.palette.error.main }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(section.id)}
                      disabled={section.id === "employment"}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  {section.fields.map((field) => (
                    <Grid item xs={12} sm={6} key={field.name}>
                      {editingSection === section.id && !field.disabled ? (
                        <TextField
                          fullWidth
                          size="small"
                          label={field.label}
                          type={field.type || "text"}
                          value={tempData[field.name] || ""}
                          onChange={(e) =>
                            handleFieldChange(field.name, e.target.value)
                          }
                        />
                      ) : (
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {field.label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formData[section.id][field.name] || "-"}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Documents Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                    <DocumentIcon />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Documents
                  </Typography>
                </Box>
                <Button
                  startIcon={<UploadIcon />}
                  variant="outlined"
                  size="small"
                >
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
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: theme.palette.error.main + "15",
                          color: theme.palette.error.main,
                        }}
                      >
                        <DocumentIcon fontSize="small" />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {doc.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {doc.type} • {doc.uploadedAt}
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Discard Changes?"
        message="Are you sure you want to discard your changes? Any unsaved changes will be lost."
        confirmText="Discard"
        confirmColor="error"
        onConfirm={confirmCancel}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </Box>
  );
};

export default PersonalInformation;
