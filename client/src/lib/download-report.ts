import { apiClient } from './api-client';

export async function downloadStudentReport(studentId: number, semester: number, studentName: string) {
  const res = await apiClient.get(`/reports/student/${studentId}`, {
    params: { semester },
    responseType: 'blob',
  });

  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `phieu-diem-${studentName.replace(/\s+/g, '-')}-hk${semester}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}