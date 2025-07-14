import * as React from 'react';

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <div style={{ 
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.6',
      color: '#000000',
      backgroundColor: '#F9F9F9',
      margin: 0,
      padding: 0
    }}>
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '70px 24px'
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #CECECE',
          borderRadius: '20px',
          padding: '50px 40px 40px 40px',
          textAlign: 'center'
        }}>
          {/* Logo Text */}
          <div style={{ 
            fontFamily: 'Inter, sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            color: '#000000',
            marginBottom: '40px',
            letterSpacing: '-0.02em'
          }}>
            PillFlow
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '32px',
            fontWeight: 600,
            color: '#000000',
            margin: '0 0 17px 0',
            letterSpacing: '-1.2px',
            lineHeight: '1.2'
          }}>
            Reset your password
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '16px',
            color: '#000000',
            margin: '0 0 40px 0',
            lineHeight: '1.5',
            fontWeight: 500
          }}>
            You requested a password reset for your PillFlow account. Click the button below to create a new password.
          </p>

          {/* CTA Button */}
          <div style={{ marginBottom: '40px' }}>
            <a 
              href={resetUrl}
              style={{
                display: 'inline-block',
                backgroundColor: '#000000',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 700,
                padding: '16px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                letterSpacing: '-0.5px',
                minWidth: '154px'
              }}
            >
              Reset Password
            </a>
          </div>

          {/* Alternative link */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{
              fontSize: '16px',
              color: '#000000',
              margin: '0 0 16px 0',
              fontWeight: 500
            }}>
              Or copy and paste this link:
            </p>
            <div style={{
              backgroundColor: '#F5F5F5',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#000000',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              textAlign: 'left'
            }}>
              <a href={resetUrl} style={{ color: '#000000', textDecoration: 'none' }}>
                {resetUrl}
              </a>
            </div>
          </div>

          {/* Warning */}
          <div style={{
            backgroundColor: '#FFF3CD',
            border: '1px solid #FFEAA7',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '40px',
            textAlign: 'left'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#000000',
              margin: 0,
              lineHeight: '1.5',
              fontWeight: 500
            }}>
              <strong>Important:</strong> This link expires in 1 hour. If you didn&apos;t request this reset, you can safely ignore this email.
            </p>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: '1px solid #E5E5E5',
            paddingTop: '30px',
            marginTop: '40px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#000000',
              margin: 0,
              lineHeight: '1.5',
              fontWeight: 500
            }}>
              Best regards,<br />
              The PillFlow Team
            </p>
            <p style={{
              fontSize: '12px',
              color: '#666666',
              margin: '16px 0 0 0',
              fontWeight: 500
            }}>
              This email was sent from PillFlow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}