'use client';

import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa6';
import {
    LuFileSpreadsheet,
    LuPlus,
    LuPencil,
    LuTrendingUp,
    LuClock
} from 'react-icons/lu';
import AddReports from './AddReports';
import EditReports from './EditReports';

interface ReportItem {
    id: string;
    title: string;
    type: string;
    format: string;
    fromDate: string;
    toDate: string;
    status: string;
}

const savedReports: ReportItem[] = [
    { id: 'REP-01', title: 'SLA On-Time Compliance Report — August', type: 'sla', format: 'pdf', fromDate: '2026-08-01', toDate: '2026-08-31', status: 'Completed' },
    { id: 'REP-02', title: 'Monthly Subscription Growth Report (MRR)', type: 'mrr', format: 'excel', fromDate: '2026-08-01', toDate: '2026-08-31', status: 'Completed' },
    { id: 'REP-03', title: 'Inter-Region Distribution Efficiency Report', type: 'regions', format: 'pdf', fromDate: '2026-07-01', toDate: '2026-07-31', status: 'Completed' },
];

export default function Reports() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-heading">Analytics & Growth Reports</h1>
                    <p className="text-sm text-body mt-0.5">Key performance indicators (KPIs) for operations growth and shipment distribution across the Kingdom.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-bold text-sm shadow-sm hover:shadow transition-all cursor-pointer"
                    >
                        <LuPlus className="w-4 h-4" />
                        <span>Generate New Report</span>
                    </button>
                </div>
            </div>

            {/* Analytics Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <LuClock className="w-5 h-5 text-accent" />
                            <h2 className="text-base font-extrabold text-heading">On-Time Delivery Rate (SLA)</h2>
                        </div>
                        <span className="text-success font-bold text-xs bg-success-soft px-2.5 py-1 rounded-full">98.2% Platform Average</span>
                    </div>
                    <div className="h-44 bg-surface-muted/50 rounded-2xl border border-border/50 flex flex-col items-center justify-center p-6 text-center">
                        <LuTrendingUp className="w-8 h-8 text-accent mb-2" />
                        <span className="text-sm font-bold text-heading">Fast Logistics Performance Snapshot</span>
                        <span className="text-xs text-body mt-1">98.2% of shipments were delivered within the target time</span>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <LuTrendingUp className="w-5 h-5 text-accent" />
                            <h2 className="text-base font-extrabold text-heading">Monthly Recurring Revenue Growth (MRR)</h2>
                        </div>
                        <span className="text-accent font-bold text-xs bg-accent/10 px-2.5 py-1 rounded-full">+18.4% This Quarter</span>
                    </div>
                    <div className="h-44 bg-surface-muted/50 rounded-2xl border border-border/50 flex flex-col items-center justify-center p-6 text-center">
                        <LuTrendingUp className="w-8 h-8 text-accent mb-2" />
                        <span className="text-sm font-bold text-heading">Recurring Revenue Growth Curve</span>
                        <span className="text-xs text-body mt-1">Positive increase in custom plan subscriptions</span>
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
                <div className="p-5 border-b border-border flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-heading">Generated & Saved Reports</h2>
                    <span className="text-xs font-bold text-body bg-surface-muted px-3 py-1.5 rounded-xl border border-border">
                        Total: {savedReports.length} reports
                    </span>
                </div>
                <div className="divide-y divide-border">
                    {savedReports.map((report) => (
                        <div key={report.id} className="p-4 flex items-center justify-between hover:bg-surface-muted/30 transition-colors">
                            <div className="flex items-center gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">
                                    <LuFileSpreadsheet className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-sm text-heading">{report.title}</h3>
                                    <span className="text-xs text-body font-latin block mt-0.5">
                                        {report.fromDate} → {report.toDate} · ({report.format.toUpperCase()})
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedReport(report);
                                        setIsEditModalOpen(true);
                                    }}
                                    title="Edit report criteria"
                                    className="p-2 rounded-xl bg-surface border border-border hover:bg-heading hover:text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                    <LuPencil className="w-4 h-4" />
                                </button>
                                <button
                                    title="Download report"
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border hover:bg-heading hover:text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                    <FaDownload className="w-3.5 h-3.5" />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Add Reports */}
            <AddReports
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            {/* Modal Edit Reports */}
            <EditReports
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedReport(null);
                }}
                reportData={selectedReport}
            />

        </div>
    );
}