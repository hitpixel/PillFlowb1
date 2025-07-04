import * as React from 'react';

interface TestEmailProps {
  timestamp?: string;
  siteUrl?: string;
  hasResendKey?: boolean;
}

export function TestEmail({ timestamp, siteUrl, hasResendKey }: TestEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ color: '#0066cc', marginBottom: '20px' }}>
          Email Test Successful! ✅
        </h1>
        
        <p style={{ marginBottom: '20px' }}>
          This is a test email from PillFlow to verify that email sending is working correctly.
        </p>
        
        <p style={{ marginBottom: '20px' }}>
          If you received this email, then:
        </p>
        
        <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '10px' }}>✅ Resend API is configured correctly</li>
          <li style={{ marginBottom: '10px' }}>✅ Email sending functionality is working</li>
          <li style={{ marginBottom: '10px' }}>✅ Your email domain is verified</li>
        </ul>
        
        {(timestamp || siteUrl || hasResendKey !== undefined) && (
          <div style={{ 
            backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '20px', 
            margin: '20px 0' 
          }}>
            <h3 style={{ marginTop: '0', color: '#334155' }}>
              Configuration Details:
            </h3>
            {siteUrl && (
              <p style={{ margin: '10px 0' }}>
                <strong>Site URL:</strong> {siteUrl}
              </p>
            )}
            {hasResendKey !== undefined && (
              <p style={{ margin: '10px 0' }}>
                <strong>Resend API Key:</strong> {hasResendKey ? "✅ Configured" : "❌ Not Set"}
              </p>
            )}
            {timestamp && (
              <p style={{ margin: '10px 0' }}>
                <strong>Time sent:</strong> {timestamp}
              </p>
            )}
          </div>
        )}
        
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
            This is a test email from PillFlow. You can safely ignore this message.
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
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ color: '#0066cc', marginBottom: '20px' }}>
          Test Invitation Email ✅
        </h1>
        
        <p style={{ marginBottom: '20px' }}>
          This is a test invitation email to verify that the invitation system is working correctly.
        </p>
        
        <p style={{ marginBottom: '20px' }}>
          In a real invitation, you would be joining an organization on PillFlow.
        </p>
        
        <div style={{ 
          backgroundColor: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px 0' 
        }}>
          <h3 style={{ marginTop: '0', color: '#334155' }}>
            How it works:
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
              backgroundColor: '#6b7280', 
              color: 'white', 
              padding: '15px 30px', 
              textDecoration: 'none', 
              borderRadius: '8px', 
              display: 'inline-block', 
              fontWeight: 'bold' 
            }}
          >
            Test Invitation Link (Non-functional)
          </a>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            Test URL:
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
          backgroundColor: '#d1fae5', 
          border: '1px solid #10b981', 
          borderRadius: '6px', 
          padding: '15px', 
          margin: '20px 0' 
        }}>
          <p style={{ margin: '0', color: '#065f46' }}>
            <strong>✅ If you received this email, the invitation system is working correctly!</strong>
          </p>
        </div>
        
        {timestamp && (
          <p style={{ marginBottom: '20px', fontSize: '14px', color: '#64748b' }}>
            Time sent: {timestamp}
          </p>
        )}
        
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
            This is a test email from PillFlow. You can safely ignore this message.
          </p>
        </div>
      </div>
    </div>
  );
} 