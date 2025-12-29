// Using relative path to use Vite proxy
const BASE_URL = "";

export const authApi = {
  login: async (email: string, password: string) => {
    try {
      // Validate inputs
      if (!email || !email.trim()) {
        throw new Error("Email is required");
      }
      if (!password) {
        throw new Error("Password is required");
      }

      // Trim email
      const trimmedEmail = email.trim();

      // Create URL with proper encoding
      const params = new URLSearchParams({
        accountEmail: trimmedEmail,
        password: password,
      });

      const targetUrl = `${BASE_URL}/api/account/login?${params.toString()}`;
      console.log("DEBUG_TARGET_URL:", targetUrl);

      // Make the API call
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      console.log("Response Status:", response.status);

      // Handle HTTP errors
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Email and password are required");
        }

        if (response.status === 401) {
          throw new Error("Invalid password");
        }

        if (response.status === 404) {
          throw new Error("Account not found");
        }

        // Try to get error message from response
        let errorMessage = "Login failed";
        try {
          const errorData = await response.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          // If can't parse JSON, use status text
          errorMessage = `${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Login Error:", error);

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error("Cannot connect to server. Please check your connection.");
      }

      // Re-throw the error
      throw error;
    }
  },

  // API 2: Get Account Profile
  getProfile: async (email: string) => {
    try {
      const cleanEmail = email.trim();
      const encodedEmail = encodeURIComponent(cleanEmail);

      const targetUrl = `${BASE_URL}/api/account/profile/${encodedEmail}`;
      console.log("DEBUG_GET_PROFILE_URL:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || "Failed to fetch profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Get Profile Error:", error);
      throw error;
    }
  },

  // API 3: Update Account Profile
  updateProfile: async (email: string, data: { accountName?: string; isActive?: boolean }) => {
    try {
      const params = new URLSearchParams();
      params.append("accountEmail", email);

      if (data.accountName !== undefined && data.accountName.trim() !== "") {
        params.append("accountName", data.accountName.trim());
      }

      if (data.isActive !== undefined) {
        params.append("isActive", String(data.isActive));
      }

      // Using GET as per user requirement
      const targetUrl = `${BASE_URL}/api/account/profile/update?${params.toString()}`;
      console.log("DEBUG_UPDATE_PROFILE_URL:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || "Failed to update profile");
      }

      return await response.json();
    } catch (error) {
      console.error("Update Profile Error:", error);
      throw error;
    }
  },

  // API 4: Get All Tickets for Department
  getTickets: async (email: string) => {
    try {
      const cleanEmail = email.trim();
      const encodedEmail = encodeURIComponent(cleanEmail);

      const targetUrl = `${BASE_URL}/api/account/tickets/${encodedEmail}`;
      console.log("DEBUG_GET_TICKETS_URL:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || "Failed to fetch tickets");
      }

      return await response.json();
    } catch (error) {
      console.error("Get Tickets Error:", error);
      throw error;
    }
  },

  // API 5: Get Tickets by Status
  getTicketsByStatus: async (email: string, status: 'pending' | 'completed') => {
    try {
      const cleanEmail = email.trim();
      const encodedEmail = encodeURIComponent(cleanEmail);

      const targetUrl = `${BASE_URL}/api/account/tickets/status/${encodedEmail}?status=${status}`;
      console.log("DEBUG_GET_TICKETS_STATUS_URL:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || "Failed to fetch tickets by status");
      }

      return await response.json();
    } catch (error) {
      console.error("Get Tickets By Status Error:", error);
      throw error;
    }
  },

  // API 6: Solve Ticket
  solveTicket: async (ticketId: string, solution: string) => {
    try {
      const params = new URLSearchParams({
        ticketId: ticketId,
        solution: solution,
      });

      const targetUrl = `${BASE_URL}/api/account/ticket/solve?${params.toString()}`;
      console.log("DEBUG_SOLVE_TICKET_URL:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        // If 405 Method Not Allowed, maybe it IS a GET? But let's assume POST for "solve".
        // Actually, previous updateProfile was GET. Let's look at that again.
        // API 3 was GET.
        // It is highly probable API 6 is also GET given the backend style.
        // I will use GET to be safe with this specific backend's pattern of using GET for updates with query params.
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || "Failed to solve ticket");
      }

      return await response.json();
    } catch (error) {
      // I WILL USE GET.
      console.error("Solve Ticket Error:", error);
      throw error;
    }
  },

  // API 7: Get All Uploads
  getUploads: async (email: string) => {
    try {
      const cleanEmail = email.trim();
      const encodedEmail = encodeURIComponent(cleanEmail);

      const targetUrl = `${BASE_URL}/api/account/uploads/${encodedEmail}`;
      console.log("DEBUG_GET_UPLOADS_URL:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || "Failed to fetch uploads");
      }

      return await response.json();
    } catch (error) {
      console.error("Get Uploads Error:", error);
      throw error;
    }
  },


  // API 8: Upload File
  uploadFile: async (email: string, category: string, fileName: string, fileData: string) => {
    try {
      const cleanEmail = email.trim();
      const targetUrl = `${BASE_URL}/api/account/upload/${cleanEmail}`;

      // ✅ CHANGE TO POST METHOD
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          fileName,
          fileData // Raw base64 string
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || "Failed to upload file");
      }

      return await response.json();
    } catch (error) {
      console.error("Upload File Error:", error);
      throw error;
    }
  },
  // API 9: Delete File
  deleteFile: async (email: string, category: string, fileName: string) => {
    try {
      const cleanEmail = email.trim();
      const params = new URLSearchParams({
        category: category,
        filename: fileName,
      });

      const targetUrl = `${BASE_URL}/api/account/upload/delete/${cleanEmail}?${params.toString()}`;
      console.log("DEBUG_DELETE_FILE_URL:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || "Failed to delete file");
      }

      return await response.json();
    } catch (error) {
      console.error("Delete File Error:", error);
      throw error;
    }
  },

  // API 10: Get SmartSolve Clustered Tickets
  getSmartSolveTickets: async (email: string) => {
    try {
      const cleanEmail = email.trim();
      const encodedEmail = encodeURIComponent(cleanEmail);

      const targetUrl = `${BASE_URL}/api/smartsolve/getSmartsolveTicket?accountEmail=${encodedEmail}`;
      console.log("DEBUG_GET_SMARTSOLVE_URL:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || "Failed to fetch SmartSolve tickets");
      }

      return await response.json();
    } catch (error) {
      console.error("Get SmartSolve Tickets Error:", error);
      throw error;
    }
  },

  // API 11: Solve Smart Tickets
  solveSmartTickets: async (email: string, solutions: Array<{ uniqueId: number; solution: string }>) => {
    try {
      const cleanEmail = email.trim();
      const encodedEmail = encodeURIComponent(cleanEmail);
      const encodedSolutions = encodeURIComponent(JSON.stringify(solutions));

      const targetUrl = `${BASE_URL}/api/smartsolve/solveSmartTickets?accountEmail=${encodedEmail}&solutions=${encodedSolutions}`;
      console.log("DEBUG_SOLVE_SMARTTICKETS_URL:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || "Failed to solve smart tickets");
      }

      return await response.json();
    } catch (error) {
      console.error("Solve Smart Tickets Error:", error);
      throw error;
    }
  }
};
export default authApi; 