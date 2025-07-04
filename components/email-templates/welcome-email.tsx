import * as React from 'react';

interface WelcomeEmailProps {
  userName: string;
}

export function WelcomeEmail({ userName }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ color: '#0066cc', marginBottom: '20px' }}>
          Welcome to PillFlow, {userName}!
        </h1>
        
        <p style={{ marginBottom: '20px' }}>
          Thank you for joining our healthcare medication management platform.
        </p>
        
        <p style={{ marginBottom: '20px' }}>Get started by:</p>
        
        <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
          <li style={{ marginBottom: '10px' }}>Completing your professional profile</li>
          <li style={{ marginBottom: '10px' }}>Setting up your organization</li>
          <li style={{ marginBottom: '10px' }}>Inviting team members</li>
        </ul>
        
        <div style={{ 
          backgroundColor: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px', 
          padding: '20px', 
          margin: '20px 0' 
        }}>
          <h3 style={{ marginTop: '0', color: '#334155' }}>
            Getting Started Tips:
          </h3>
          <p style={{ margin: '10px 0' }}>
            • Complete your professional profile to unlock all features
          </p>
          <p style={{ margin: '10px 0' }}>
            • Set up your organization details for better collaboration
          </p>
          <p style={{ margin: '10px 0' }}>
            • Invite team members to start working together
          </p>
        </div>
        
        <p style={{ marginBottom: '20px' }}>
          If you have any questions, feel free to reach out to our support team.
        </p>
        
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
            This email was sent from PillFlow, the healthcare medication management platform.
          </p>
        </div>
      </div>
    </div>
  );
} 