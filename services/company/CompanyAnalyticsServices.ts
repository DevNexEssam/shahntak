/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const companyAnalyticsServices = {
    getAnalyticsTab: async (tab: string, startDate: string = "", endDate: string = ""): Promise<any> => {
        const { data } = await axios.get(
            `/api/company/analytics?tab=${tab}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
        );
        return data;
    },
};
