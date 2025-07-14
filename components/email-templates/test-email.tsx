import * as React from 'react';

interface TestEmailProps {
  timestamp?: string;
  siteUrl?: string;
  hasResendKey?: boolean;
}

export function TestEmail({ timestamp, siteUrl, hasResendKey }: TestEmailProps) {
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
          Email Test Successful
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#666666',
          margin: '0 0 48px 0',
          lineHeight: '1.5'
        }}>
          This is a test email from PillFlow to verify that email sending is working correctly.
        </p>

        {/* Status */}
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '48px',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#000000',
            margin: '0 0 24px 0'
          }}>
            System Status
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: '#ffffff', fontSize: '12px' }}>✓</span>
              </div>
              <p style={{ margin: 0, fontSize: '16px', color: '#000000' }}>Resend API configured</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: '#ffffff', fontSize: '12px' }}>✓</span>
              </div>
              <p style={{ margin: 0, fontSize: '16px', color: '#000000' }}>Email sending functional</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: '#ffffff', fontSize: '12px' }}>✓</span>
              </div>
              <p style={{ margin: 0, fontSize: '16px', color: '#000000' }}>Domain verified</p>
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        {(timestamp || siteUrl || hasResendKey !== undefined) && (
          <div style={{
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '48px',
            textAlign: 'left'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Configuration Details
            </h3>
            {siteUrl && (
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666666' }}>
                <strong>Site URL:</strong> {siteUrl}
              </p>
            )}
            {hasResendKey !== undefined && (
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666666' }}>
                <strong>Resend API Key:</strong> {hasResendKey ? "Configured" : "Not Set"}
              </p>
            )}
            {timestamp && (
              <p style={{ margin: 0, fontSize: '14px', color: '#666666' }}>
                <strong>Time sent:</strong> {timestamp}
              </p>
            )}
          </div>
        )}

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
            This is a test email from PillFlow
          </p>
        </div>
      </div>
    </div>
  );
}

interface TestInvitationEmailProps {
  joinUrl: string;
  timestamp?: string;
}

export function TestInvitationEmail({ joinUrl, timestamp }: TestInvitationEmailProps) {
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
          Test Invitation Email
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#666666',
          margin: '0 0 48px 0',
          lineHeight: '1.5'
        }}>
          This is a test invitation email to verify that the invitation system is working correctly.
        </p>

        {/* How it works */}
        <div style={{
          backgroundColor: '#f9f9f9',
          borderRadius: '12px',
          padding: '40px',
          marginBottom: '48px',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#000000',
            margin: '0 0 24px 0'
          }}>
            How it works
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#000000' }}>Existing users</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666666' }}>Sign in and you'll automatically join the organization</p>
            </div>
            
            <div>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#000000' }}>New users</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666666' }}>Create your account and you'll be added to the organization immediately</p>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div style={{ marginBottom: '48px' }}>
          <a 
            href={joinUrl}
            style={{
              display: 'inline-block',
              backgroundColor: '#6b7280',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 600,
              padding: '16px 32px',
              borderRadius: '8px',
              textDecoration: 'none',
              letterSpacing: '-0.01em'
            }}
          >
            Test Invitation Link
          </a>
        </div>

        {/* Test URL */}
        <div style={{ marginBottom: '48px' }}>
          <p style={{
            fontSize: '14px',
            color: '#666666',
            margin: '0 0 16px 0'
          }}>
            Test URL:
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
            <a href={joinUrl} style={{ color: '#000000', textDecoration: 'none' }}>
              {joinUrl}
            </a>
          </div>
        </div>

        {/* Success Message */}
        <div style={{
          backgroundColor: '#d1fae5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '48px',
          textAlign: 'left'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#065f46',
            margin: 0,
            lineHeight: '1.5'
          }}>
            <strong>Success:</strong> If you received this email, the invitation system is working correctly!
          </p>
        </div>

        {timestamp && (
          <p style={{
            fontSize: '14px',
            color: '#666666',
            margin: '0 0 48px 0'
          }}>
            Time sent: {timestamp}
          </p>
        )}

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
            This is a test email from PillFlow
          </p>
        </div>
      </div>
    </div>
  );
}