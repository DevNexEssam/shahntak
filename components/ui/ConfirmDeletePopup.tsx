import React from 'react';
import { LuTrash2, LuX, LuLoaderCircle, LuShieldAlert } from 'react-icons/lu';

interface ConfirmDeletePopupProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    isDeleting?: boolean;
}

const ConfirmDeletePopup: React.FC<ConfirmDeletePopupProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = "تأكيد الحذف",
    description = "هل أنت تأكد من رغبتك في حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.",
    isDeleting = false,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-heading/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-extrabold text-xl">
                        <LuShieldAlert className="w-6 h-6" />
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="p-2 rounded-xl hover:bg-surface-muted text-body hover:text-heading transition-colors cursor-pointer"
                    >
                        <LuX className="w-5 h-5" />
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-extrabold text-heading">{title}</h3>
                    <p className="text-sm text-body mt-1.5 leading-relaxed">{description}</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-5 py-2.5 rounded-xl border border-border bg-surface text-heading hover:bg-surface-muted font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                        إلغاء
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <LuLoaderCircle className="w-4 h-4 animate-spin" />
                                <span>جاري الحذف...</span>
                            </>
                        ) : (
                            <>
                                <LuTrash2 className="w-4 h-4" />
                                <span>حذف نهائي</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeletePopup;
