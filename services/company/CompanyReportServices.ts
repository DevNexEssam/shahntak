/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const companyReportServices = {
    getReports: async (): Promise<any> => {
        const { data } = await axios.get("/api/company/reports");
        return data;
    },
};
