import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
// Importing a generic back icon from react-bootstrap-icons, if needed.
// For this specific case, react-bootstrap-icons might be an overkill for just an arrow.
// We can use a simple text "Back" or a Unicode arrow if an icon library is not desired yet.
// For now, let's use a Unicode character or text for the back button.

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname === '/';

  return (
    <Navbar bg="light" expand="lg" className="mb-3 shadow-sm">
      <Container fluid> {/* fluid to match max-w-7xl more closely, or use regular Container */}
        <div className="d-flex align-items-center"> {/* Flex container for back button and brand */}
          {!isRoot && (
            <Button
              variant="link"
              onClick={() => navigate(-1)}
              className="me-2 p-0 text-decoration-none text-dark" // Simple styling for back button
            >
              &#x2190; {/* Unicode Left Arrow */}
            </Button>
          )}
          <Navbar.Brand 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer', fontSize: '1.5rem', fontWeight: 'bold' }}
          >
            Course Planner
          </Navbar.Brand>
        </div>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <LinkContainer to="/advisor">
              <Button 
                variant="primary"
                // Applying some gradient-like styling if possible with Bootstrap, or use custom CSS.
                // React Bootstrap Buttons support variants, not complex gradients directly via props.
                // For simplicity, a standard primary button will be used.
                // Custom CSS would be needed for the exact gradient.
                style={{
                  // Example of a simple purple button, not a gradient
                  // backgroundColor: '#8A2BE2', // Violet
                  // borderColor: '#8A2BE2',
                  // For a gradient, one might need to use custom CSS classes
                }}
              >
                {/* SVG Icon can be kept if it's simple and doesn't rely on external CSS classes from lucide */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-stars me-2" viewBox="0 0 16 16">
                  <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828z"/>
                  <path d="M4.684 4.684a.361.361 0 0 1 0-.686l.645-1.937a.361.361 0 0 1 .686 0l.645 1.937a.361.361 0 0 1 0 .686l-.645 1.937a.361.361 0 0 1-.686 0zM1.47 8.53a.361.361 0 0 1-.686 0L.139 6.593a.361.361 0 0 1 0-.686l1.936-.645a.361.361 0 0 1 .686 0l.645 1.937a.361.361 0 0 1 0 .686l-.645 1.937a.361.361 0 0 1-.686 0zm10.079-3.846a.361.361 0 0 1 0-.686l.645-1.937a.361.361 0 0 1 .686 0l.645 1.937a.361.361 0 0 1 0 .686l-.645 1.937a.361.361 0 0 1-.686 0z"/>
                </svg>
                Ask AI Advisor
              </Button>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
