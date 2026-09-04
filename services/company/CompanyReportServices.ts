/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const companyReportServices = {
    getReports: async (type?: string): Promise<any> => {
        const url = type ? `/api/company/reports?type=${type}` : "/api/company/reports";
        const { data } = await axios.get(url);
        return data;
    },
};
