import * as React from 'react';

interface WelcomeEmailProps {
  userName: string;
}

export function WelcomeEmail({ userName }: WelcomeEmailProps) {
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
          Welcome to PillFlow, {userName}
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#666666',
          margin: '0 0 48px 0',
          lineHeight: '1.5'
        }}>
          Thank you for joining our healthcare medication management platform. We're excited to help you streamline your workflow.
        </p>

        {/* Getting Started */}
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
            Getting Started
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#000000',
                color: '#ffffff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600,
                flexShrink: 0
              }}>1</div>
              <div>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#000000' }}>Complete your profile</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666666' }}>Add your professional details to unlock all features</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#000000',
                color: '#ffffff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600,
                flexShrink: 0
              }}>2</div>
              <div>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#000000' }}>Set up your organization</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666666' }}>Configure your team and workspace settings</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#000000',
                color: '#ffffff',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600,
                flexShrink: 0
              }}>3</div>
              <div>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#000000' }}>Invite your team</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666666' }}>Start collaborating with colleagues</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ marginBottom: '48px' }}>
          <a 
            href="https://pillflow.app"
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
            Get Started
          </a>
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