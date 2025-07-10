"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Define types for medication log and patient data
interface MedicationLogEntry {
  _id: string;
  actionType: "added" | "updated" | "stopped" | "deleted" | "change_requested" | "change_approved" | "change_rejected" | "removal_requested" | "removal_approved" | "removal_rejected" | "request_canceled" | "addition_requested" | "addition_approved" | "addition_rejected";
  medicationName: string;
  performedAt: number;
  currentDosage?: string;
  currentMorningDose?: string;
  currentAfternoonDose?: string;
  currentEveningDose?: string;
  currentNightDose?: string;
  currentInstructions?: string;
  changes?: string;
  requestNotes?: string;
  status?: "completed" | "pending" | "approved" | "rejected" | "canceled";
  performedByUser: {
    firstName: string;
    lastName: string;
  } | null;
  performedByOrg: {
    name: string;
    type: string;
  } | null;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  streetAddress: string;
  suburb: string;
  state: string;
  postcode: string;
  preferredPack?: 'blister' | 'sachets';
}

interface MedicationLogsExportProps {
  logs: MedicationLogEntry[];
  patient: Patient;
  onExportComplete?: () => void;
}

// Helper function to get action text
const getActionText = (actionType: string): string => {
  switch (actionType) {
    case 'added': return 'Added';
    case 'updated': return 'Updated';
    case 'stopped': return 'Stopped';
    case 'deleted': return 'Deleted';
    case 'change_requested': return 'Change Requested';
    case 'change_approved': return 'Change Approved';
    case 'change_rejected': return 'Change Rejected';
    case 'removal_requested': return 'Removal Requested';
    case 'removal_approved': return 'Removal Approved';
    case 'removal_rejected': return 'Removal Rejected';
    case 'request_canceled': return 'Request Canceled';
    case 'addition_requested': return 'Addition Requested';
    case 'addition_approved': return 'Addition Approved';
    case 'addition_rejected': return 'Addition Rejected';
    default: return actionType;
  }
};

// Helper function to get action color
const getActionColor = (actionType: string): string => {
  switch (actionType) {
    case 'added':
    case 'addition_approved':
      return '#16A34A'; // green
    case 'updated':
    case 'change_approved':
      return '#3B82F6'; // blue
    case 'stopped':
    case 'deleted':
    case 'removal_approved':
      return '#DC2626'; // red
    case 'change_requested':
    case 'removal_requested':
    case 'addition_requested':
      return '#F59E0B'; // yellow
    case 'change_rejected':
    case 'removal_rejected':
    case 'addition_rejected':
    case 'request_canceled':
      return '#6B7280'; // gray
    default:
      return '#6B7280';
  }
};

// PDF Document Component
const MedicationLogsPDFDocument: React.FC<{ logs: MedicationLogEntry[]; patient: Patient }> = ({ 
  logs, 
  patient 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Patient Medication History</Text>
        <Text style={styles.subtitle}>
          Generated on {format(new Date(), 'dd/MM/yyyy HH:mm')}
        </Text>
      </View>

      {/* Patient Information */}
      <View style={styles.patientSection}>
        <Text style={styles.sectionTitle}>Patient Information</Text>
        <View style={styles.patientGrid}>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Name:</Text>
            <Text style={styles.patientValue}>{patient.firstName} {patient.lastName}</Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Date of Birth:</Text>
            <Text style={styles.patientValue}>
              {format(new Date(patient.dateOfBirth), 'dd/MM/yyyy')}
            </Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Phone:</Text>
            <Text style={styles.patientValue}>{patient.phone || 'N/A'}</Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Email:</Text>
            <Text style={styles.patientValue}>{patient.email || 'N/A'}</Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Address:</Text>
            <Text style={styles.patientValue}>
              {patient.streetAddress}, {patient.suburb}, {patient.state} {patient.postcode}
            </Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.patientLabel}>Pack Type:</Text>
            <Text style={styles.patientValue}>
              {patient.preferredPack ? 
                patient.preferredPack.charAt(0).toUpperCase() + patient.preferredPack.slice(1) : 
                'Not specified'
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Logs Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Medication History Summary</Text>
        <Text style={styles.summaryText}>
          Total Log Entries: {logs.length}
        </Text>
        <Text style={styles.summaryText}>
          Period: {logs.length > 0 ? `${format(new Date(logs[logs.length - 1].performedAt), 'dd/MM/yyyy')} - ${format(new Date(logs[0].performedAt), 'dd/MM/yyyy')}` : 'No entries'}
        </Text>
      </View>

      {/* Medication Logs */}
      <View style={styles.logsSection}>
        <Text style={styles.sectionTitle}>Medication History (Chronological Order)</Text>
        
        {logs.length === 0 ? (
          <View style={styles.noLogsSection}>
            <Text style={styles.noLogsText}>No medication history found for this patient.</Text>
          </View>
        ) : (
          logs.map((log, index) => (
            <View key={log._id} style={[
              styles.logCard, 
              index % 2 === 0 ? styles.evenCard : styles.oddCard
            ]}>
              {/* Log Header */}
              <View style={styles.logHeader}>
                <View style={styles.logHeaderLeft}>
                  <Text style={[styles.actionBadge, { color: getActionColor(log.actionType) }]}>
                    {getActionText(log.actionType)}
                  </Text>
                  <Text style={styles.medicationName}>{log.medicationName}</Text>
                </View>
                <Text style={styles.logDate}>
                  {format(new Date(log.performedAt), 'dd/MM/yyyy HH:mm')}
                </Text>
              </View>

              {/* Performer Information */}
              <View style={styles.performerSection}>
                <Text style={styles.performerText}>
                  Performed by: {log.performedByUser ? 
                    `${log.performedByUser.firstName} ${log.performedByUser.lastName}` : 
                    'Unknown User'
                  }
                </Text>
                <Text style={styles.organizationText}>
                  Organisation: {log.performedByOrg ? 
                    `${log.performedByOrg.name} (${log.performedByOrg.type})` : 
                    'Unknown Organisation'
                  }
                </Text>
              </View>

              {/* Medication Details */}
              <View style={styles.medicationDetailsSection}>
                {log.currentDosage && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Dosage:</Text>
                    <Text style={styles.detailValue}>{log.currentDosage}</Text>
                  </View>
                )}
                
                {/* Dosing Schedule */}
                {(log.currentMorningDose || log.currentAfternoonDose || log.currentEveningDose || log.currentNightDose) && (
                  <View style={styles.dosingScheduleSection}>
                    <Text style={styles.dosingTitle}>Dosing Schedule:</Text>
                    <View style={styles.dosingGrid}>
                      {log.currentMorningDose && (
                        <View style={styles.dosingItem}>
                          <Text style={styles.dosingLabel}>Morning:</Text>
                          <Text style={styles.dosingValue}>{log.currentMorningDose}</Text>
                        </View>
                      )}
                      {log.currentAfternoonDose && (
                        <View style={styles.dosingItem}>
                          <Text style={styles.dosingLabel}>Afternoon:</Text>
                          <Text style={styles.dosingValue}>{log.currentAfternoonDose}</Text>
                        </View>
                      )}
                      {log.currentEveningDose && (
                        <View style={styles.dosingItem}>
                          <Text style={styles.dosingLabel}>Evening:</Text>
                          <Text style={styles.dosingValue}>{log.currentEveningDose}</Text>
                        </View>
                      )}
                      {log.currentNightDose && (
                        <View style={styles.dosingItem}>
                          <Text style={styles.dosingLabel}>Night:</Text>
                          <Text style={styles.dosingValue}>{log.currentNightDose}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {log.currentInstructions && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Instructions:</Text>
                    <Text style={styles.detailValue}>{log.currentInstructions}</Text>
                  </View>
                )}
              </View>

              {/* Changes Information */}
              {log.changes && (
                <View style={styles.changesSection}>
                  <Text style={styles.changesTitle}>Changes:</Text>
                  <Text style={styles.changesText}>{log.changes}</Text>
                </View>
              )}

              {/* Request Notes */}
              {log.requestNotes && (
                <View style={styles.notesSection}>
                  <Text style={styles.notesTitle}>Request Notes:</Text>
                  <Text style={styles.notesText}>{log.requestNotes}</Text>
                </View>
              )}

              {/* Status */}
              {log.status && (
                <View style={styles.statusSection}>
                  <Text style={styles.statusText}>Status: {log.status.toUpperCase()}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This report contains {logs.length} medication history entries for {patient.firstName} {patient.lastName}.
        </Text>
        <Text style={styles.footerText}>
          Export generated by PillFlow Healthcare Management System
        </Text>
      </View>
    </Page>
  </Document>
);

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  patientSection: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 5,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1F2937',
  },
  patientGrid: {
    flexDirection: 'column',
  },
  patientRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  patientLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    width: '25%',
    color: '#4B5563',
  },
  patientValue: {
    fontSize: 8,
    width: '75%',
    color: '#1F2937',
  },
  summarySection: {
    marginBottom: 15,
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 3,
  },
  summaryText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 2,
  },
  logsSection: {
    flex: 1,
  },
  noLogsSection: {
    padding: 20,
    textAlign: 'center',
  },
  noLogsText: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  logCard: {
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 3,
  },
  evenCard: {
    backgroundColor: '#F9FAFB',
  },
  oddCard: {
    backgroundColor: '#FFFFFF',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 4,
  },
  logHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionBadge: {
    fontSize: 8,
    fontWeight: 'bold',
    marginRight: 10,
    padding: 2,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
  },
  medicationName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  logDate: {
    fontSize: 8,
    color: '#6B7280',
  },
  performerSection: {
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performerText: {
    fontSize: 8,
    color: '#4B5563',
  },
  organizationText: {
    fontSize: 8,
    color: '#4B5563',
  },
  medicationDetailsSection: {
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  detailLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6B7280',
    width: '25%',
  },
  detailValue: {
    fontSize: 8,
    color: '#1F2937',
    width: '75%',
  },
  dosingScheduleSection: {
    marginTop: 4,
    marginBottom: 4,
  },
  dosingTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 3,
  },
  dosingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dosingItem: {
    flexDirection: 'row',
    marginRight: 15,
    marginBottom: 2,
  },
  dosingLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#6B7280',
    marginRight: 3,
  },
  dosingValue: {
    fontSize: 7,
    color: '#1F2937',
  },
  changesSection: {
    marginTop: 6,
    padding: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
  },
  changesTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  changesText: {
    fontSize: 8,
    color: '#4B5563',
  },
  notesSection: {
    marginTop: 6,
    padding: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 3,
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 2,
  },
  notesText: {
    fontSize: 8,
    color: '#1E40AF',
  },
  statusSection: {
    marginTop: 4,
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#6B7280',
    marginBottom: 2,
  },
});

// Export function
export const exportMedicationLogsToPDF = async (
  logs: MedicationLogEntry[], 
  patient: Patient
): Promise<void> => {
  try {
    const blob = await pdf(
      <MedicationLogsPDFDocument logs={logs} patient={patient} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medication-logs-${patient.firstName.toLowerCase()}-${patient.lastName.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating medication logs PDF:', error);
    throw new Error('Failed to export medication logs to PDF');
  }
};

// Hook for export functionality
export const useMedicationLogsPDFExport = (
  logs: MedicationLogEntry[], 
  patient: Patient | null,
  onExportComplete?: () => void
) => {
  const handleExport = async () => {
    if (!patient) {
      throw new Error('Patient information is required for export');
    }
    
    try {
      await exportMedicationLogsToPDF(logs, patient);
      onExportComplete?.();
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  return { handleExport };
}; 