import * as React from 'react';

interface OrganizationInviteEmailProps {
  organizationName: string;
  inviterName: string;
  inviteToken: string;
  joinUrl: string;
}

export function OrganizationInviteEmail({ 
  organizationName, 
  inviterName, 
  inviteToken, 
  joinUrl 
}: OrganizationInviteEmailProps) {
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
            You&apos;re invited to join {organizationName}
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '16px',
            color: '#000000',
            margin: '0 0 40px 0',
            lineHeight: '1.5',
            fontWeight: 500
          }}>
            {inviterName} has invited you to join their organization on PillFlow, a healthcare medication management platform.
          </p>

          {/* CTA Button */}
          <div style={{ marginBottom: '40px' }}>
            <a 
              href={joinUrl}
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
              Accept Invitation
            </a>
          </div>

          {/* Instructions */}
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
              How to join
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

          {/* Invitation Token */}
          <div style={{
            backgroundColor: '#F9F9F9',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '40px',
            textAlign: 'left'
          }}>
            <p style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#000000',
              margin: '0 0 8px 0'
            }}>
              Your invitation code:
            </p>
            <code style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              color: '#000000',
              backgroundColor: '#FFFFFF',
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #E5E5E5',
              display: 'block',
              textAlign: 'center',
              letterSpacing: '0.05em'
            }}>
              {inviteToken}
            </code>
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
              <a href={joinUrl} style={{ color: '#000000', textDecoration: 'none' }}>
                {joinUrl}
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
              fontSize: '16px',
              color: '#000000',
              margin: 0,
              lineHeight: '1.5',
              fontWeight: 500
            }}>
              <strong>Important:</strong> This invitation expires in 7 days. Please accept it soon to join the team!
            </p>
          </div>

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
              This email was sent from PillFlow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}