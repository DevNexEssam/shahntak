import { Company, CompanyResponse, CompanySingleResponse, CompanyDeleteResponse, CompanyFullDetailsResponse } from "@/types/data";
import axios from "axios";

export const companyServices = {
    // Get paginated companies list
    getCompanies: async (page: number = 1, limit: number = 10): Promise<CompanyResponse> => {
        const { data } = await axios.get(`/api/admin/companies?page=${page}&limit=${limit}`);
        return data;
    },

    // Get all companies without pagination
    getAllCompanies: async (): Promise<CompanyResponse> => {
        const { data } = await axios.get("/api/admin/companies?nopagination=true");
        return data;
    },

    // Get single company by ID
    getCompanyById: async (id: string): Promise<CompanySingleResponse> => {
        const { data } = await axios.get(`/api/admin/companies/${id}`);
        return data;
    },

    // Get full company details with metrics & stats by ID
    getCompanyFullDetails: async (id: string): Promise<CompanyFullDetailsResponse> => {
        const { data } = await axios.get(`/api/admin/companies/${id}/details`);
        return data;
    },

    // Create a new company
    createCompany: async (payload: { data: Partial<Company> }): Promise<CompanySingleResponse> => {
        const { data } = await axios.post("/api/admin/companies/new", payload.data);
        return data;
    },

    // Update company details by ID
    updateCompany: async (payload: { id: string; updates: Partial<Company> }): Promise<CompanySingleResponse> => {
        const { data } = await axios.patch(`/api/admin/companies/${payload.id}`, payload.updates);
        return data;
    },

    // Custom Business Logic: Update company status (active, inactive, archived, banned)
    updateCompanyStatus: async (payload: { id: string; status: Company["status"] }): Promise<CompanySingleResponse> => {
        const { data } = await axios.patch(`/api/admin/companies/${payload.id}`, { status: payload.status });
        return data;
    },

    // Custom Business Logic: Approve company registration
    approveCompany: async (payload: { id: string; approvedBy: string }): Promise<CompanySingleResponse> => {
        const { data } = await axios.patch(`/api/admin/companies/${payload.id}`, {
            approvedBy: payload.approvedBy,
            approvedAt: new Date().toISOString(),
        });
        return data;
    },

    // Delete company (Soft or Hard Delete) by ID
    deleteCompany: async ({ id, hard = false }: { id: string; hard?: boolean }): Promise<CompanyDeleteResponse> => {
        const { data } = await axios.delete(`/api/admin/companies/${id}`, {
            params: { hard }
        });
        return data;
    },
};
