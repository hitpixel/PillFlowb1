import * as React from 'react';

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <div style={{ 
      fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.6',
      color: '#000000',
      backgroundColor: '#ffffff',
      margin: 0,
      padding: 0
    }}>
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '64px 24px',
        textAlign: 'center'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '48px' }}>
          <img 
            src="https://pillflow.app/pillflowb.png" 
            alt="PillFlow" 
            style={{ 
              width: '120px', 
              height: '32px',
              margin: '0 auto'
            }} 
          />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#000000',
          margin: '0 0 16px 0',
          letterSpacing: '-0.02em'
        }}>
          Reset your password
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#666666',
          margin: '0 0 48px 0',
          lineHeight: '1.5'
        }}>
          You requested a password reset for your PillFlow account. Click the button below to create a new password.
        </p>

        {/* CTA Button */}
        <div style={{ marginBottom: '48px' }}>
          <a 
            href={resetUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#000000',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 600,
              padding: '16px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              letterSpacing: '-0.01em'
            }}
          >
            Reset Password
          </a>
        </div>

        {/* Alternative link */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{
            fontSize: '14px',
            color: '#666666',
            margin: '0 0 16px 0'
          }}>
            Or copy and paste this link:
          </p>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#000000',
            wordBreak: 'break-all',
            fontFamily: 'monospace'
          }}>
            <a href={resetUrl} style={{ color: '#000000', textDecoration: 'none' }}>
              {resetUrl}
            </a>
          </div>
        </div>

        {/* Warning */}
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '48px',
          textAlign: 'left'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#856404',
            margin: 0,
            lineHeight: '1.5'
          }}>
            <strong>Important:</strong> This link expires in 1 hour. If you didn't request this reset, you can safely ignore this email.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #e5e5e5',
          paddingTop: '32px',
          marginTop: '48px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#999999',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Best regards,<br />
            The PillFlow Team
          </p>
          <p style={{
            fontSize: '12px',
            color: '#cccccc',
            margin: '16px 0 0 0'
          }}>
            This email was sent from PillFlow
          </p>
        </div>
      </div>
    </div>
  );
}