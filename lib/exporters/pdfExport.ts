import jsPDF from 'jspdf';
import { Course, BrandSettings } from '../types';

function applyBranding(doc: jsPDF, brand: BrandSettings) {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
            : { r: 99, g: 102, b: 241 };
    };
    return hexToRgb(brand.primaryColor);
}

export async function exportCourseManualPdf(course: Course): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const brand = course.brandSnapshot;
    const primary = applyBranding(doc, brand);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Cover page
    doc.setFillColor(primary.r, primary.g, primary.b);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(course.title, contentWidth);
    doc.text(titleLines, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Training Course Manual', pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
    if (brand.companyName && brand.companyName !== 'TrainDash.io') {
        doc.setFontSize(12);
        doc.text(brand.companyName, pageWidth / 2, pageHeight - 30, { align: 'center' });
    }
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString(), pageWidth / 2, pageHeight - 20, { align: 'center' });

    // Table of Contents
    doc.addPage();
    doc.setFillColor(248, 249, 250);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setFillColor(primary.r, primary.g, primary.b);
    doc.rect(0, 0, 4, 25, 'F');
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Table of Contents', margin + 4, 17);
    let y = 40;
    doc.setFontSize(11);
    course.lessons.forEach((lesson, idx) => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primary.r, primary.g, primary.b);
        doc.text(`${idx + 1}.`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 30, 30);
        doc.text(lesson.title, margin + 8, y);
        doc.setTextColor(150, 150, 150);
        doc.text(`~${lesson.estimatedMinutes} min`, pageWidth - margin, y, { align: 'right' });
        y += 10;
        if (y > pageHeight - 30) { doc.addPage(); y = 30; }
    });

    // Lesson content
    for (const lesson of course.lessons) {
        doc.addPage();
        // Chapter header
        doc.setFillColor(primary.r, primary.g, primary.b);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        const chLines = doc.splitTextToSize(lesson.title, contentWidth);
        doc.text(chLines, margin, 20);
        y = 45;
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const cleanContent = lesson.manualContent
            .replace(/^#{1,6}\s+(.*)/gm, '$1')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/^- \s+/gm, '• ');

        const contentLines = doc.splitTextToSize(cleanContent, contentWidth);
        for (const line of contentLines) {
            if (y > pageHeight - 20) { doc.addPage(); y = 30; }
            doc.text(line, margin, y);
            y += 6;
        }
    }

    // Footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(primary.r, primary.g, primary.b);
        doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(brand.companyName || 'TrainDash.io', margin, pageHeight - 3);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 3, { align: 'right' });
    }
    const safeTitle = course.title.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_');
    doc.save(`${safeTitle}_Manual.pdf`);
}

export async function exportMasterExamPdf(course: Course): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const brand = course.brandSnapshot;
    const primary = applyBranding(doc, brand);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    // Cover
    doc.setFillColor(primary.r, primary.g, primary.b);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Master Exam', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const titleLines = doc.splitTextToSize(course.title, contentWidth);
    doc.text(titleLines, pageWidth / 2, 32, { align: 'center' });

    let y = 60;
    let questionCount = 1;

    for (const lesson of course.lessons) {
        if (lesson.quiz.length === 0) continue;

        // Section header
        if (y > pageHeight - 60) { doc.addPage(); y = 30; }
        doc.setFillColor(240, 240, 255);
        doc.rect(margin - 2, y - 6, contentWidth + 4, 10, 'F');
        doc.setFillColor(primary.r, primary.g, primary.b);
        doc.rect(margin - 2, y - 6, 3, 10, 'F');
        doc.setTextColor(primary.r, primary.g, primary.b);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(lesson.title, margin + 4, y);
        y += 14;

        for (const q of lesson.quiz) {
            if (y > pageHeight - 50) { doc.addPage(); y = 30; }
            // Question
            doc.setTextColor(30, 30, 30);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const qLines = doc.splitTextToSize(`${questionCount}. ${q.question}`, contentWidth);
            doc.text(qLines, margin, y);
            y += qLines.length * 6 + 2;

            // Options
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const letters = ['A', 'B', 'C', 'D'];
            q.options.forEach((opt, idx) => {
                if (y > pageHeight - 20) { doc.addPage(); y = 30; }
                const cleanOpt = opt.replace(/^[A-E][.):\s]+/, '').trim();
                const optLines = doc.splitTextToSize(`  ${letters[idx]}. ${cleanOpt}`, contentWidth - 8);
                doc.text(optLines, margin + 4, y);
                y += optLines.length * 6;
            });

            // Answer blank
            doc.setTextColor(150, 150, 150);
            doc.text('Answer: _______', margin, y + 3);
            y += 14;
            questionCount++;
        }
    }

    // Answer key page
    doc.addPage();
    doc.setFillColor(primary.r, primary.g, primary.b);
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Answer Key', pageWidth / 2, 16, { align: 'center' });
    y = 40;
    questionCount = 1;
    const letters = ['A', 'B', 'C', 'D'];

    for (const lesson of course.lessons) {
        if (lesson.quiz.length === 0) continue;
        doc.setTextColor(primary.r, primary.g, primary.b);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        if (y > pageHeight - 30) { doc.addPage(); y = 30; }
        doc.text(lesson.title, margin, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);

        for (const q of lesson.quiz) {
            if (y > pageHeight - 15) { doc.addPage(); y = 30; }
            doc.text(
                `${questionCount}. ${letters[q.correctIndex]} — ${q.explanation}`,
                margin,
                y
            );
            y += 7;
            questionCount++;
        }
        y += 5;
    }
    const safeTitle = course.title.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_');
    doc.save(`${safeTitle}_Master_Exam.pdf`);
}
