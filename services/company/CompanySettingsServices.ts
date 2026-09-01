/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const companySettingsServices = {
    getSettings: async (): Promise<any> => {
        const { data } = await axios.get("/api/company/settings");
        return data;
    },

    updateSettings: async (payload: { updates: any }): Promise<any> => {
        const { data } = await axios.put("/api/company/settings", payload.updates);
        return data;
    },
};
