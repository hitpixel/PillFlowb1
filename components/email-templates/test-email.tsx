import * as React from 'react';

interface TestEmailProps {
  timestamp?: string;
  siteUrl?: string;
  hasResendKey?: boolean;
}

export function TestEmail({ timestamp, siteUrl, hasResendKey }: TestEmailProps) {
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
            Email Test Successful ✅
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '16px',
            color: '#000000',
            margin: '0 0 40px 0',
            lineHeight: '1.5',
            fontWeight: 500
          }}>
            This is a test email from PillFlow to verify that email sending is working correctly.
          </p>

          {/* Status */}
          <div style={{
            backgroundColor: '#D1FAE5',
            border: '1px solid #10B981',
            borderRadius: '12px',
            padding: '40px',
            marginBottom: '40px',
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
                  backgroundColor: '#000000',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ color: '#ffffff', fontSize: '12px' }}>✓</span>
                </div>
                <p style={{ margin: 0, fontSize: '16px', color: '#000000', fontWeight: 500 }}>Resend API configured</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#000000',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ color: '#ffffff', fontSize: '12px' }}>✓</span>
                </div>
                <p style={{ margin: 0, fontSize: '16px', color: '#000000', fontWeight: 500 }}>Email sending functional</p>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#000000',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ color: '#ffffff', fontSize: '12px' }}>✓</span>
                </div>
                <p style={{ margin: 0, fontSize: '16px', color: '#000000', fontWeight: 500 }}>Domain verified</p>
              </div>
            </div>
          </div>

          {/* Configuration Details */}
          {(timestamp || siteUrl || hasResendKey !== undefined) && (
            <div style={{
              backgroundColor: '#F9F9F9',
              borderRadius: '8px',
              padding: '24px',
              marginBottom: '40px',
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
                <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#000000', fontWeight: 500 }}>
                  <strong>Site URL:</strong> {siteUrl}
                </p>
              )}
              {hasResendKey !== undefined && (
                <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#000000', fontWeight: 500 }}>
                  <strong>Resend API Key:</strong> {hasResendKey ? "Configured" : "Not Set"}
                </p>
              )}
              {timestamp && (
                <p style={{ margin: 0, fontSize: '16px', color: '#000000', fontWeight: 500 }}>
                  <strong>Time sent:</strong> {timestamp}
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{
            borderTop: '1px solid #E5E5E5',
            paddingTop: '30px',
            marginTop: '40px'
          }}>
            <p style={{
              fontSize: '16px',
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
              This is a test email from PillFlow
            </p>
          </div>
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
            Test Invitation Email
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '16px',
            color: '#000000',
            margin: '0 0 40px 0',
            lineHeight: '1.5',
            fontWeight: 500
          }}>
            This is a test invitation email to verify that the invitation system is working correctly.
          </p>

          {/* How it works */}
          <div style={{
            backgroundColor: '#F9F9F9',
            borderRadius: '12px',
            padding: '40px',
            marginBottom: '40px',
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
                <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#000000', fontWeight: 500 }}>Sign in and you&apos;ll automatically join the organization</p>
              </div>
              
              <div>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#000000' }}>New users</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#000000', fontWeight: 500 }}>Create your account and you&apos;ll be added to the organization immediately</p>
              </div>
            </div>
          </div>

          {/* Test Button */}
          <div style={{ marginBottom: '40px' }}>
            <a 
              href={joinUrl}
              style={{
                display: 'inline-block',
                backgroundColor: '#6B7280',
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
              Test Invitation Link
            </a>
          </div>

          {/* Test URL */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{
              fontSize: '16px',
              color: '#000000',
              margin: '0 0 16px 0',
              fontWeight: 500
            }}>
              Test URL:
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
              <a href={joinUrl} style={{ color: '#000000', textDecoration: 'none' }}>
                {joinUrl}
              </a>
            </div>
          </div>

          {/* Success Message */}
          <div style={{
            backgroundColor: '#D1FAE5',
            border: '1px solid #10B981',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '40px',
            textAlign: 'left'
          }}>
            <p style={{
              fontSize: '16px',
              color: '#000000',
              margin: 0,
              lineHeight: '1.5',
              fontWeight: 500
            }}>
              <strong>Success:</strong> If you received this email, the invitation system is working correctly!
            </p>
          </div>

          {timestamp && (
            <p style={{
              fontSize: '16px',
              color: '#000000',
              margin: '0 0 40px 0',
              fontWeight: 500
            }}>
              Time sent: {timestamp}
            </p>
          )}

          {/* Footer */}
          <div style={{
            borderTop: '1px solid #E5E5E5',
            paddingTop: '30px',
            marginTop: '40px'
          }}>
            <p style={{
              fontSize: '16px',
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
              This is a test email from PillFlow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}