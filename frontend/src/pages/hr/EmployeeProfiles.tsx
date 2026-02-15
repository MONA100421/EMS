import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  OpenInNew as OpenIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import api from "../../lib/api";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  phone: string;
  department: string;
  title: string;
  visaType: string;
  status: "active" | "inactive";
}

const mockEmployees: Employee[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    preferredName: "Johnny",
    email: "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    department: "Engineering",
    title: "Software Engineer",
    visaType: "OPT",
    status: "active",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Miller",
    preferredName: "",
    email: "sarah.miller@company.com",
    phone: "+1 (555) 234-5678",
    department: "Marketing",
    title: "Marketing Manager",
    visaType: "Green Card",
    status: "active",
  },
  {
    id: "3",
    firstName: "Michael",
    lastName: "Chen",
    preferredName: "Mike",
    email: "michael.chen@company.com",
    phone: "+1 (555) 345-6789",
    department: "Engineering",
    title: "Senior Developer",
    visaType: "H1-B",
    status: "active",
  },
  {
    id: "4",
    firstName: "Emily",
    lastName: "Johnson",
    preferredName: "Em",
    email: "emily.johnson@company.com",
    phone: "+1 (555) 456-7890",
    department: "HR",
    title: "HR Coordinator",
    visaType: "Citizen",
    status: "active",
  },
  {
    id: "5",
    firstName: "David",
    lastName: "Lee",
    preferredName: "",
    email: "david.lee@company.com",
    phone: "+1 (555) 567-8901",
    department: "Engineering",
    title: "DevOps Engineer",
    visaType: "OPT STEM",
    status: "active",
  },
  {
    id: "6",
    firstName: "Lisa",
    lastName: "Wang",
    preferredName: "",
    email: "lisa.wang@company.com",
    phone: "+1 (555) 678-9012",
    department: "Finance",
    title: "Financial Analyst",
    visaType: "L2",
    status: "inactive",
  },
];

const EmployeeProfiles: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    return (
      emp.firstName.toLowerCase().includes(query) ||
      emp.lastName.toLowerCase().includes(query) ||
      emp.preferredName.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query)
    );
  });

  const handleRowClick = (employeeId: string) => {
    window.open(`/hr/employees/${employeeId}`, "_blank");
  };

  const handleSearch = async (q: string) => {
    const res = await api.get(`/hr/employees/search?q=${q}`);
    setEmployees(res.data.employees);
  };

  const handleSearchInput = (q: string) => {
    setSearchQuery(q);
    if (!q) {
      setEmployees(mockEmployees);
      return;
    }
    handleSearch(q);
  };


  useEffect(() => {
    const fetchEmployees = async () => {
      const res = await api.get("/hr/employees");
      setEmployees(res.data.employees);
    };

    fetchEmployees();
  }, []);


  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Employee Profiles
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                {employees.length} total employee
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                placeholder="Search by name or preferred name..."
                size="small"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ color: theme.palette.text.secondary }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Visa Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow
                  key={employee.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => handleRowClick(employee.id)}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {employee.firstName[0]}
                        {employee.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {employee.firstName} {employee.lastName}
                          {employee.preferredName && (
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{
                                color: theme.palette.text.secondary,
                                ml: 1,
                              }}
                            >
                              ({employee.preferredName})
                            </Typography>
                          )}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {employee.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={employee.visaType}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        employee.status === "active" ? "Active" : "Inactive"
                      }
                      size="small"
                      sx={{
                        fontWeight: 500,
                        bgcolor:
                          employee.status === "active"
                            ? `${theme.palette.success.main}15`
                            : `${theme.palette.grey[500]}15`,
                        color:
                          employee.status === "active"
                            ? theme.palette.success.main
                            : theme.palette.grey[600],
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Open in new tab">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(employee.id);
                        }}
                      >
                        <OpenIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredEmployees.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.secondary }}
            >
              No employees found matching "{searchQuery}"
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default EmployeeProfiles;
