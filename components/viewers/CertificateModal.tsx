import { useState } from 'react';
import jsPDF from 'jspdf';
import { Award, Download, X } from 'lucide-react';
import { Course } from '@/lib/types';

interface CertificateModalProps {
    course: Course;
    onClose: () => void;
}

export default function CertificateModal({ course, onClose }: CertificateModalProps) {
    const [name, setName] = useState('');

    const handleDownload = async () => {
        if (!name.trim()) return;

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();
        const brand = course.brandSnapshot;

        // Draw Border
        doc.setDrawColor(brand.primaryColor || '#6366f1');
        doc.setLineWidth(4);
        doc.rect(10, 10, width - 20, height - 20);
        doc.setLineWidth(1);
        doc.rect(14, 14, width - 28, height - 28);

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(40);
        doc.setTextColor(brand.primaryColor || '#6366f1');
        doc.text('CERTIFICATE OF COMPLETION', width / 2, 50, { align: 'center' });

        // Subtext
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.setTextColor('#4b5563'); // gray-600
        doc.text('This proudly certifies that', width / 2, 80, { align: 'center' });

        // Name
        doc.setFont('times', 'italic');
        doc.setFontSize(36);
        doc.setTextColor('#1f2937'); // gray-800
        doc.text(name, width / 2, 105, { align: 'center' });

        // Course Text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(16);
        doc.setTextColor('#4b5563');
        doc.text('has successfully completed the training requirements for:', width / 2, 130, { align: 'center' });

        // Course Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(brand.primaryColor || '#6366f1');
        const splitTitle = doc.splitTextToSize(course.title, width - 60);
        doc.text(splitTitle, width / 2, 145, { align: 'center' });

        // Date & Org
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor('#6b7280');
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(`Awarded on ${dateStr}`, width / 2, height - 35, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(brand.companyName || 'TrainDash.io', width / 2, height - 25, { align: 'center' });

        // Logo
        if (brand.logoUrl) {
            try {
                // simple image embedding (works if base64)
                doc.addImage(brand.logoUrl, 'PNG', width / 2 - 15, height - 60, 30, 30, undefined, 'FAST');
            } catch (e) {
                console.warn('Failed to embed logo in certificate', e);
            }
        }

        doc.save(`${course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_certificate.pdf`);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: 24
        }}>
            <div className="animate-fade-in glass" style={{
                background: 'var(--bg-card)', padding: 40, borderRadius: 16,
                maxWidth: 500, width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: 16, right: 16, background: 'transparent',
                    border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}>
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Award size={40} style={{ color: 'var(--primary)' }} />
                    </div>
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: 8, color: 'var(--text)' }}>
                    Congratulations!
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.95rem' }}>
                    You have successfully completed <strong>{course.title}</strong>. Enter your name below to claim your official certificate.
                </p>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-subtle)' }}>
                        Full Name on Certificate
                    </label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        style={{ fontSize: '1.1rem', padding: 12 }}
                    />
                </div>

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: 14, fontSize: '1rem' }}
                    onClick={handleDownload}
                    disabled={!name.trim()}
                >
                    <Download size={20} />
                    Download PDF Certificate
                </button>
            </div>
        </div>
    );
}
