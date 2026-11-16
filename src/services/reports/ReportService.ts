import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ActivitySession, ChildProfile, ASSISTANCE_LEVELS } from '../../types';
import { DataService } from '../firebase/dataService';

export class ReportService {
  /**
   * Export detailed session reports for a child or all sessions as CSV
   */
  static exportSessionsToCSV(sessions: ActivitySession[], children: ChildProfile[]): void {
    const childMap = new Map(children.map((c) => [c.id, c.name]));

    const headers = [
      'Session ID',
      'Date & Time',
      'Child Name',
      'Language',
      'Status',
      'Selected Activities',
      'Stars Earned',
      'Badges',
      'Total Attempts',
      'Correct Attempts',
      'Success Rate (%)',
      'Total Duration (s)',
      'Assistance Levels Breakdown',
      'Clinical Notes',
    ];

    const rows = sessions.map((s) => {
      const childName = childMap.get(s.childId) || s.childId;
      const dateStr = new Date(s.startTime).toLocaleString();
      const totalAttempts = s.attempts.length;
      const correctAttempts = s.attempts.filter((a) => a.isCorrect).length;
      const rate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100;
      const durationSec = s.endTime ? Math.round((s.endTime - s.startTime) / 1000) : 0;

      const assistanceCounts = s.attempts.reduce((acc, att) => {
        const lvl = ASSISTANCE_LEVELS[att.assistanceLevel]?.label || `Level ${att.assistanceLevel}`;
        acc[lvl] = (acc[lvl] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const assistanceStr = Object.entries(assistanceCounts)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');

      return [
        s.id,
        `"${dateStr}"`,
        `"${childName}"`,
        s.language.toUpperCase(),
        s.status,
        `"${s.selectedActivities.join(', ')}"`,
        s.totalStars,
        `"${s.badgesEarned.join(', ')}"`,
        totalAttempts,
        correctAttempts,
        rate,
        durationSec,
        `"${assistanceStr}"`,
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DIVAD_Clinical_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export professional Pediatric OT Clinical PDF Report
   */
  static exportChildReportPDF(child: ChildProfile, sessions: ActivitySession[]): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const therapist = DataService.getTherapistUser();

    // Header banner with DIVAD colors
    doc.setFillColor(2, 132, 199); // Blue
    doc.rect(0, 0, 210, 28, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('DIVAD PEDIATRIC OT PROGRESS REPORT', 14, 14);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Dressing Independence with Visual & Auditory Device | SIMATS Center', 14, 21);

    // Metadata section
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Child Profile Summary', 14, 38);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Child Name: ${child.name}`, 14, 45);
    doc.text(`Age: ${child.age} years | Gender: ${child.gender}`, 14, 51);
    doc.text(
      `Baseline Level: Level ${child.baselineAssistanceLevel} (${ASSISTANCE_LEVELS[child.baselineAssistanceLevel]?.label})`,
      14,
      57
    );
    doc.text(`Preferred Instruction Language: ${child.preferredLanguage === 'ta' ? 'Tamil' : 'English'}`, 14, 63);

    doc.text(`Supervising Therapist: ${therapist.displayName}`, 110, 45);
    doc.text(`Facility: ${therapist.organization || 'SIMATS Occupational Therapy'}`, 110, 51);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 110, 57);
    doc.text(`Total Sessions Logged: ${sessions.length}`, 110, 63);

    // Horizontal Divider
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 68, 196, 68);

    // Clinical Summary Metrics
    const totalAttempts = sessions.reduce((acc, s) => acc + s.attempts.length, 0);
    const correctAttempts = sessions.reduce(
      (acc, s) => acc + s.attempts.filter((a) => a.isCorrect).length,
      0
    );
    const overallSuccess = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100;
    const totalStars = sessions.reduce((acc, s) => acc + s.totalStars, 0);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Performance Summary Across Sessions', 14, 76);

    autoTable(doc, {
      startY: 80,
      head: [['Total Sessions', 'Total Attempts', 'Correct Attempts', 'Overall Accuracy', 'Stars Earned']],
      body: [[`${sessions.length}`, `${totalAttempts}`, `${correctAttempts}`, `${overallSuccess}%`, `${totalStars} ⭐`]],
      theme: 'grid',
      headStyles: { fillColor: [234, 179, 8], textColor: [113, 63, 18], fontStyle: 'bold' },
      styles: { halign: 'center', fontSize: 10 },
    });

    // Session History Table
    const lastY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Recent Dressing Sessions & Fastener Breakdown', 14, lastY);

    const sessionRows = sessions.map((s) => [
      new Date(s.startTime).toLocaleDateString(),
      s.selectedActivities.map((a) => a.toUpperCase()).join(', '),
      s.attempts.length.toString(),
      `${s.attempts.filter((a) => a.isCorrect).length}/${s.attempts.length}`,
      `${s.totalStars} ⭐`,
      s.status.toUpperCase(),
      s.notes || 'Routine session completed smoothly.',
    ]);

    autoTable(doc, {
      startY: lastY + 4,
      head: [['Date', 'Activities', 'Attempts', 'Accuracy', 'Stars', 'Status', 'Clinical Notes']],
      body: sessionRows.length > 0 ? sessionRows : [['No sessions recorded yet.', '-', '-', '-', '-', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      columnStyles: {
        6: { cellWidth: 55 },
      },
    });

    // Sign-off section at bottom
    const footerY = 270;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('Generated automatically by DIVAD Dressing Independence Clinical System', 14, footerY);
    doc.text('Therapist Signature: _______________________', 120, footerY);

    doc.save(`DIVAD_Report_${child.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  }
}

