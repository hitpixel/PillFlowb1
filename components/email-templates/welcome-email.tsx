import * as React from 'react';

interface WelcomeEmailProps {
  userName: string;
}

export function WelcomeEmail({ userName }: WelcomeEmailProps) {
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
            Welcome to PillFlow, {userName}
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '16px',
            color: '#000000',
            margin: '0 0 40px 0',
            lineHeight: '1.5',
            fontWeight: 500
          }}>
            Thank you for joining our healthcare medication management platform. We&apos;re excited to help you streamline your workflow.
          </p>

          {/* Getting Started */}
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
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#000000', fontWeight: 500 }}>Add your professional details to unlock all features</p>
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
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#000000', fontWeight: 500 }}>Configure your team and workspace settings</p>
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
                  <p style={{ margin: '4px 0 0 0', fontSize: '16px', color: '#000000', fontWeight: 500 }}>Start collaborating with colleagues</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div style={{ marginBottom: '40px' }}>
            <a 
              href="https://pillflow.app"
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
              Get Started
            </a>
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