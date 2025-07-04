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
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ color: '#0066cc', marginBottom: '20px' }}>
          You&apos;ve been invited to join {organizationName}
        </h1>
        
        <p style={{ marginBottom: '20px' }}>
          {inviterName} has invited you to join their organization on PillFlow.
        </p>
        
        <p style={{ marginBottom: '20px' }}>
          PillFlow is a healthcare medication management platform designed for medical professionals.
        </p>
        
        <div style={{ 
          backgroundColor: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px 0' 
        }}>
          <h3 style={{ marginTop: '0', color: '#334155' }}>
            Getting Started:
          </h3>
          <p style={{ marginBottom: '10px' }}>
                         <strong>If you already have an account:</strong> Sign in and you&apos;ll automatically join the organization.
           </p>
           <p style={{ marginBottom: '0' }}>
             <strong>If you&apos;re new to PillFlow:</strong> Create your account and you&apos;ll be added to the organization immediately.
          </p>
        </div>
        
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a 
            href={joinUrl}
            style={{ 
              backgroundColor: '#0066cc', 
              color: 'white', 
              padding: '15px 30px', 
              textDecoration: 'none', 
              borderRadius: '8px', 
              display: 'inline-block', 
              fontWeight: 'bold' 
            }}
          >
            Accept Invitation & Join {organizationName}
          </a>
        </div>
        
        <div style={{ 
          backgroundColor: '#f1f5f9', 
          border: '1px solid #cbd5e1', 
          borderRadius: '8px', 
          padding: '15px', 
          margin: '20px 0' 
        }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
            Your invitation token:
          </p>
          <code style={{ 
            backgroundColor: '#e2e8f0', 
            padding: '8px 12px', 
            borderRadius: '4px', 
            fontFamily: 'monospace',
            fontSize: '14px',
            display: 'block',
            textAlign: 'center'
          }}>
            {inviteToken}
          </code>
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
              href={joinUrl}
              style={{ 
                color: '#0066cc', 
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              {joinUrl}
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
            <strong>⏰ Important:</strong> This invitation will expire in 7 days. 
            Please accept it soon to join the team!
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
                       This invitation was sent from PillFlow. If you didn&apos;t expect this invitation, 
           you can safely ignore this email.
          </p>
        </div>
      </div>
    </div>
  );
} 