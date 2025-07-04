import * as React from 'react';

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ color: '#0066cc', marginBottom: '20px' }}>
          Reset your password
        </h1>
        
        <p style={{ marginBottom: '20px' }}>
          You requested a password reset for your PillFlow account.
        </p>
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={resetUrl}
            style={{ 
              backgroundColor: '#0066cc', 
              color: 'white', 
              padding: '12px 24px', 
              textDecoration: 'none', 
              borderRadius: '6px', 
              display: 'inline-block',
              fontWeight: 'bold'
            }}
          >
            Reset Password
          </a>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            Or copy and paste this link into your browser:
          </p>
          <div style={{ 
            backgroundColor: '#f1f5f9', 
            padding: '10px', 
            borderRadius: '4px', 
            border: '1px solid #cbd5e1',
            wordBreak: 'break-all'
          }}>
            <a 
              href={resetUrl}
              style={{ 
                color: '#0066cc', 
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              {resetUrl}
            </a>
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#fef3cd', 
          border: '1px solid #fbbf24', 
          borderRadius: '6px', 
          padding: '15px', 
          margin: '20px 0' 
        }}>
          <p style={{ margin: '0', color: '#92400e' }}>
                         <strong>⏰ Important:</strong> This link will expire in 1 hour. 
             If you didn&apos;t request this reset, you can safely ignore this email.
          </p>
        </div>
        
        <p style={{ marginBottom: '20px' }}>
          Best regards,<br />
          The PillFlow Team
        </p>
        
        <div style={{ 
          borderTop: '1px solid #e2e8f0', 
          paddingTop: '20px', 
          marginTop: '40px', 
          fontSize: '14px', 
          color: '#64748b' 
        }}>
          <p style={{ margin: '0' }}>
                       This email was sent from PillFlow. If you didn&apos;t request a password reset, 
           please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
} 