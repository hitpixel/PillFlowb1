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
          You're invited to join {organizationName}
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#666666',
          margin: '0 0 48px 0',
          lineHeight: '1.5'
        }}>
          {inviterName} has invited you to join their organization on PillFlow, a healthcare medication management platform.
        </p>

        {/* CTA Button */}
        <div style={{ marginBottom: '48px' }}>
          <a 
            href={joinUrl}
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
            Accept Invitation
          </a>
        </div>

        {/* Instructions */}
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
            How to join
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

        {/* Invitation Token */}
        <div style={{
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '48px',
          textAlign: 'left'
        }}>
          <p style={{
            fontSize: '14px',
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
            backgroundColor: '#ffffff',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #e5e5e5',
            display: 'block',
            textAlign: 'center',
            letterSpacing: '0.05em'
          }}>
            {inviteToken}
          </code>
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
            <a href={joinUrl} style={{ color: '#000000', textDecoration: 'none' }}>
              {joinUrl}
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
            <strong>Important:</strong> This invitation expires in 7 days. Please accept it soon to join the team!
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