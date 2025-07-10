"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Define types for medication and patient data
interface Medication {
  _id: string;
  medicationName: string;
  dosage: string;
  morningDose?: string;
  afternoonDose?: string;
  eveningDose?: string;
  nightDose?: string;
  instructions?: string;
  prescribedBy?: string;
  prescribedDate?: string;
  brandName?: string;
  genericName?: string;
  activeIngredient?: string;
  strength?: string;
  route?: string;
  isActive: boolean;
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



// PDF Document Component
const MedicationsPDFDocument: React.FC<{ medications: Medication[]; patient: Patient }> = ({ 
  medications, 
  patient 
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Patient Medications Report</Text>
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

      {/* Medications Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Medications Summary</Text>
        <Text style={styles.summaryText}>
          Total Active Medications: {medications.filter(m => m.isActive).length}
        </Text>
      </View>

      {/* Medications Table */}
      <View style={styles.medicationsSection}>
        <Text style={styles.sectionTitle}>Medication Details & Dosing Schedule</Text>
        
        {medications.filter(m => m.isActive).map((medication, index) => (
          <View key={medication._id} style={[
            styles.medicationCard, 
            index % 2 === 0 ? styles.evenCard : styles.oddCard
          ]}>
            {/* Medication Header */}
            <View style={styles.medicationHeader}>
              <Text style={styles.medicationName}>{medication.medicationName}</Text>
              <Text style={styles.medicationDosage}>{medication.dosage}</Text>
            </View>

            {/* Medication Details */}
            <View style={styles.medicationDetails}>
              {medication.brandName && (
                <Text style={styles.detailText}>Brand: {medication.brandName}</Text>
              )}
              {medication.genericName && (
                <Text style={styles.detailText}>Generic: {medication.genericName}</Text>
              )}
              {medication.strength && (
                <Text style={styles.detailText}>Strength: {medication.strength}</Text>
              )}
              {medication.route && (
                <Text style={styles.detailText}>Route: {medication.route}</Text>
              )}
              {medication.prescribedBy && (
                <Text style={styles.detailText}>Prescribed by: {medication.prescribedBy}</Text>
              )}
            </View>

            {/* Dosing Schedule Table */}
            <View style={styles.dosingTable}>
              <Text style={styles.dosingTitle}>Daily Dosing Schedule:</Text>
              <View style={styles.dosingHeader}>
                <View style={styles.dosingCol}>
                  <Text style={styles.dosingHeaderText}>Morning</Text>
                </View>
                <View style={styles.dosingCol}>
                  <Text style={styles.dosingHeaderText}>Afternoon</Text>
                </View>
                <View style={styles.dosingCol}>
                  <Text style={styles.dosingHeaderText}>Evening</Text>
                </View>
                <View style={styles.dosingCol}>
                  <Text style={styles.dosingHeaderText}>Night</Text>
                </View>
              </View>
              <View style={styles.dosingRow}>
                <View style={styles.dosingCol}>
                  <Text style={styles.dosingText}>
                    {medication.morningDose || '-'}
                  </Text>
                </View>
                <View style={styles.dosingCol}>
                  <Text style={styles.dosingText}>
                    {medication.afternoonDose || '-'}
                  </Text>
                </View>
                <View style={styles.dosingCol}>
                  <Text style={styles.dosingText}>
                    {medication.eveningDose || '-'}
                  </Text>
                </View>
                <View style={styles.dosingCol}>
                  <Text style={styles.dosingText}>
                    {medication.nightDose || '-'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Instructions */}
            {medication.instructions && (
              <View style={styles.instructionsSection}>
                <Text style={styles.instructionsTitle}>Instructions:</Text>
                <Text style={styles.instructionsText}>{medication.instructions}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This report contains {medications.filter(m => m.isActive).length} active medications for {patient.firstName} {patient.lastName}.
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
    fontSize: 10,
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
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 5,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  patientGrid: {
    flexDirection: 'column',
  },
  patientRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  patientLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    width: '25%',
    color: '#4B5563',
  },
  patientValue: {
    fontSize: 9,
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
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  medicationsSection: {
    flex: 1,
  },
  medicationCard: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 5,
  },
  evenCard: {
    backgroundColor: '#F9FAFB',
  },
  oddCard: {
    backgroundColor: '#FFFFFF',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 5,
  },
  medicationName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  medicationDosage: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  medicationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 8,
    color: '#4B5563',
    marginRight: 15,
    marginBottom: 2,
  },
  dosingTable: {
    marginBottom: 8,
  },
  dosingTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1F2937',
  },
  dosingHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  dosingRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderTopWidth: 0,
  },
  dosingCol: {
    flex: 1,
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
    alignItems: 'center',
  },
  dosingHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  dosingText: {
    fontSize: 8,
    color: '#1F2937',
    textAlign: 'center',
  },
  instructionsSection: {
    marginTop: 5,
    padding: 5,
    backgroundColor: '#FEF3C7',
    borderRadius: 3,
  },
  instructionsTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 2,
  },
  instructionsText: {
    fontSize: 8,
    color: '#92400E',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 2,
  },
});

// Export function
export const exportMedicationsToPDF = async (
  medications: Medication[], 
  patient: Patient
): Promise<void> => {
  try {
    const blob = await pdf(
      <MedicationsPDFDocument medications={medications} patient={patient} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medications-${patient.firstName.toLowerCase()}-${patient.lastName.toLowerCase()}-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating medications PDF:', error);
    throw new Error('Failed to export medications to PDF');
  }
};

// Hook for export functionality
export const useMedicationsPDFExport = (
  medications: Medication[], 
  patient: Patient | null,
  onExportComplete?: () => void
) => {
  const handleExport = async () => {
    if (!patient) {
      throw new Error('Patient information is required for export');
    }
    
    try {
      await exportMedicationsToPDF(medications, patient);
      onExportComplete?.();
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  return { handleExport };
}; 